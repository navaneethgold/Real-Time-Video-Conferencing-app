import { useState,useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home=()=>{
    const [userData,setuserData]=useState({});
    const [isLogged,setisLogged]=useState(null);
    const navigate=useNavigate();
    useEffect(()=>{
        const checkAuth=async()=>{
            const res=await axios.get("http://localhost:8000/check-Auth");
            if(res.data.isAuthenticated){
                setisLogged(true);
                setuserData(res.data.user);
            }else{
                setisLogged(false);
            }
        }
    })
}