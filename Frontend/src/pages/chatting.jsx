import { useState,useEffect,useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const Chatting=()=>{
    const [userData,setuserData]=useState({});
    const [isLogged,setisLogged]=useState(null);
    const navigate=useNavigate();
    const [message,setMessage]=useState('');
    const [targetUser,setTargetUser]=useState('');
    const socketRef = useRef(null);
    useEffect(()=>{
        const checkAuth=async()=>{
            try{
                const res=await axios.get("http://localhost:8000/check-Auth", { withCredentials: true });
                if(res.data.isAuthenticated){
                    setisLogged(true);
                    setuserData(res.data.user);
                }else{
                    setisLogged(false);
                    navigate("/login");
                }
            }catch(err){
                console.error("Auth check failed", err);    
                setisLogged(false);
                navigate("/login");
            }
            
        }
        checkAuth();
    },[]);
    

    const handleChangeUser=(e)=>{
        setTargetUser(e.target.value);
    }

    const handleChangeMessage=(e)=>{
        setMessage(e.target.value);
    }

    const handleSubmit=async(e)=>{
        e.preventDefault(); // important
        console.log("submit clicked");

      try {
        console.log("submit clicked");
        const res = await axios.get(`http://localhost:8000/getID/${targetUser}`);
        const tuserId = res.data.tarUser;
        socketRef.current.emit("private-message", { to: tuserId, message });
        setMessage(""); // clear input
      } catch (err) {
        console.error("Failed to send message", err);
      }
    }
    useEffect(() => {
      if (isLogged && userData._id && !socketRef.current) {
        socketRef.current = io("http://localhost:8000", {
          auth: { userId: userData._id },
          withCredentials: true
        });
    
        socketRef.current.on("private-message", ({ from, message }) => {
          console.log("Message from", from, ":", message);
        });
      }
    
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }, [isLogged, userData._id]);




    return(
        <>
            <form onSubmit={handleSubmit}>
                <div className="messageBox">
                    <input type="text" value={targetUser} onChange={handleChangeUser} required/>
                    <input type="text" value={message} onChange={handleChangeMessage} required/>
                </div>
                <button type="submit">Send</button>
            </form>
        </>
    )
}
export default Chatting;