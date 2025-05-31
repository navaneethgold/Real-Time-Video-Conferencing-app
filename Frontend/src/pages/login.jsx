import { useState,useEffect } from "react";
import axios from "axios";

const Login=()=>{
    const[formData,setformData]=useState({
        username:"",
        password:""
    })
    const handleChange=(e)=>{
        setformData(prev=>({
            ...prev,
            [e.target.name]:e.target.value
        }))
    }
    const handleSubmit=async(e)=>{
        e.preventDefault();
        try{
            console.log(formData.username);
            const res=await axios.post("http://localhost:8000/login",formData,{
                withCredentials:true
            });
            console.log(res.data.username);
            alert("Login successful");

        }catch(error){
            console.log(error);
            alert("Login failed");
        }
    }
    return(
        <form onSubmit={handleSubmit}>
            <div className="login">
                <input type="text" name="username" value={formData.username} onChange={handleChange}/>
                <input type="password" name="password" value={formData.password} onChange={handleChange} />
            </div>
            <button type="submit">Login</button>
        </form>
    )
}
export default Login;