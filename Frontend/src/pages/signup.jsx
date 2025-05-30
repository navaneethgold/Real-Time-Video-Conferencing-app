import { useState,useEffect } from "react";
import axios from 'axios';
const Signup=()=>{
    const [formData,setformData]=useState({
        username:"",
        password:""
    });
    const handleChange=(e)=>{
        setformData(prev=>({
            ...prev,
            [e.target.name]:e.target.value
        }));
    }
    const handleSubmit=async(e)=>{
        e.preventDefault();
        try{
            await axios.post("http://localhost:8000/signup",formData,{
                withCredentials:true
            });
            alert("sign up successful");

        }catch(error){
            console.log(error);
            alert("signup failed");
        }
    }
    return(
        <div>
            <form onSubmit={handleSubmit}>
                <div className="username">
                    <input type="text" name="username" value={formData.username} onChange={handleChange} required/>
                </div>
                <div className="password">
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
    )
}
export default Signup;