import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Styles/login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/login", formData, {
        withCredentials: true
      });
      console.log("Logged in as:", res.data.username);
      alert("Login successful");
      navigate("/home"); // redirect after login if needed
    } catch (error) {
      console.log(error);
      alert("Login failed");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-card">
        <h2 className="login-title"><img src="op1.png" alt="icon" />Welcome Back to Lucid Talk👋</h2>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Username"
          className="login-input"
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          className="login-input"
        />
        <button type="submit" className="login-button">Login</button>
        <p className="signup-text">
          Don't have an account? <span onClick={() => navigate("/signup")} className="signup-link">Sign up</span>
        </p>
      </form>
    </div>
  );
};

export default Login;
