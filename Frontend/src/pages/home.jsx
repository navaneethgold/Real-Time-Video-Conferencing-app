import { useState,useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home=()=>{
    const [userData,setuserData]=useState({});
    const [isLogged,setisLogged]=useState(null);
    const navigate=useNavigate();
    useEffect(()=>{
        const checkAuth=async()=>{
            try{
                const res=await axios.get("http://localhost:8000/check-Auth", { withCredentials: true });
                if(res.data.isAuthenticated){
                    setisLogged(true);
                    setuserData(res.data.user);
                }else{
                    setisLogged(false);
                }
            }catch(err){
                console.error("Auth check failed", err);
                setisLogged(false);
            }
            
        }
        checkAuth();
    },[]);
    return(
        <>
            {isLogged?(
                <h1>{userData.username}</h1>
            ):(
                <h1>Not Logged in</h1>
            )}
        </>
    )
}
export default Home;