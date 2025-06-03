import { useState,useEffect,useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import "../Styles/chatting.css";
import { blue } from "@mui/material/colors";
const Chatting=({roomId})=>{
    const navigate=useNavigate();
    const [message,setMessage]=useState('');
    const socketRef2 = useRef(null);
    const [userData, setUserData] = useState({});
    const [messages, setMessages] = useState([]);


    useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("http://localhost:8000/check-Auth", {
          withCredentials: true,
        });
        if (res.data.isAuthenticated) {
          setUserData(res.data.user);
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error("Auth check failed", err);
        navigate("/login");
      }
    };
    checkAuth();
  }, []);

    const handleChangeMessage=(e)=>{
        setMessage(e.target.value);
    }

    const handleSubmit = async (e) => {
    e.preventDefault();
    if (!socketRef2.current || message.trim() === '') return;

    const newMessage = {
      from: userData.username,
      text: message,
      isOwn: true
    };
    const un=userData.username;
    // Emit and update UI
    socketRef2.current.emit("private-message", { roomId, message,un });
    setMessage("");
    // setMessages((prev) => [...prev, newMessage]);
    // setMessage("");
  };
    useEffect(() => {
      if (userData._id && !socketRef2.current && roomId) {
        socketRef2.current = io("http://localhost:8000", {
          auth:{userId:userData._id},
          withCredentials: true
        });
    
        socketRef2.current.emit("join-room-2", {roomId});

        socketRef2.current.on("private-message", ({ roomId, message, un }) => {
          const newMsg = {
            from: un || 'Anonymous',
            text: message,
            isOwn: false
          };
          setMessages((prev) => [...prev, newMsg]);
        });
      } 
    
      return () => {
        if (socketRef2.current) {
          socketRef2.current.disconnect();
          socketRef2.current = null;
        }
      };
    }, [userData._id,roomId]);




    return(
        <div id="chat">
          <div className="inside">
            <h2 style={{color:"white"}}>Chat</h2>
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div
                  key={index}
                >
                  <span className="sender">{msg.from}:</span> <span id="txt1">{msg.text}</span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSubmit}>
              <div className="vals">
                <input type="text" value={message} onChange={handleChangeMessage} placeholder="Type a Message" required/>
                <button type="submit" className="send"><SendRoundedIcon style={{color:'#77f7d9'}}/></button>
              </div>
            </form>
          </div>
            
        </div>
    )
}
export default Chatting;