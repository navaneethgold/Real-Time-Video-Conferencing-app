import { useState,useEffect,useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const Chatting=({roomId})=>{
    const [userData2,setuserData2]=useState({});
    const [isLogged2,setisLogged2]=useState(null);
    const navigate=useNavigate();
    const [message,setMessage]=useState('');
    const [targetUser2,settargetUser2]=useState('');
    const socketRef2 = useRef(null);
    useEffect(()=>{
        const checkAuth=async()=>{
            try{
                const res=await axios.get("http://localhost:8000/check-Auth", { withCredentials: true });
                if(res.data.isAuthenticated){
                    setisLogged2(true);
                    setuserData2(res.data.user);
                }else{
                    setisLogged2(false);
                    navigate("/login");
                }
            }catch(err){
                console.error("Auth check failed", err);    
                setisLogged2(false);
                navigate("/login");
            }
            
        }
        checkAuth();
    },[]);
    

    const handleChangeUser=(e)=>{
        settargetUser2(e.target.value);
    }

    const handleChangeMessage=(e)=>{
        setMessage(e.target.value);
    }

    const handleSubmit=async(e)=>{
        e.preventDefault(); // important
        console.log("submit clicked");

      try {
        console.log("submit clicked");
        socketRef2.current.emit("private-message", { roomId, message });
        setMessage(""); // clear input
        
      } catch (err) {
        console.error("Failed to send message", err);
      }
    }
    useEffect(() => {
      if (isLogged2 && userData2._id && !socketRef2.current) {
        socketRef2.current = io("http://localhost:8000", {
          auth: { userId: userData2._id },
          withCredentials: true
        });
    
        socketRef2.current.emit("join-room", {roomId});

        socketRef2.current.on("private-message", ({ roomId, message }) => {
          console.log("Message from", roomId, ":", message);
        });
      } 
    
      return () => {
        if (socketRef2.current) {
          socketRef2.current.disconnect();
          socketRef2.current = null;
        }
      };
    }, [isLogged2, userData2._id]);




    return(
        <>
            <form onSubmit={handleSubmit}>
                <div className="messageBox">
                    <input type="text" value={targetUser2} onChange={handleChangeUser} required/>
                    <input type="text" value={message} onChange={handleChangeMessage} required/>
                </div>
                <button type="submit">Send</button>
            </form>
        </>
    )
}
export default Chatting;