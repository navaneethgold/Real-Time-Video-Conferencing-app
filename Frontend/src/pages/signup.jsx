import { useState } from "react";
import axios from 'axios';
import "../Styles/signup.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:8000/signup", {
        username: formData.username,
        password: formData.password
      }, {
        withCredentials: true
      });

      if (res.data.err) {
        setError(res.data.err); // user already exists
        return;
      }

      alert("Sign up successful!");
      setError(""); // Clear any previous error
      // optionally navigate to login page
    } catch (error) {
      console.error(error);
      setError("Signup failed due to a server error.");
    }
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit} className="signup-form">
        <h2>Create Account</h2>

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        {error && <p className="error-message" style={{color:"white"}}>{error}</p>}

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Signup;
