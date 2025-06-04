import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Styles/home.css"; // Add this line

const Home = () => {
  const [userData, setuserData] = useState({});
  const [isLogged, setisLogged] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("http://localhost:8000/check-Auth", {
          withCredentials: true,
        });
        if (res.data.isAuthenticated) {
          setisLogged(true);
          setuserData(res.data.user);
        } else {
          setisLogged(false);
        }
      } catch (err) {
        console.error("Auth check failed", err);
        setisLogged(false);
      }
    };
    checkAuth();
  }, []);
  const logout = async () => {
    try {
      await axios.post("http://localhost:8000/logout", {}, {
        withCredentials: true,
      });
      setisLogged(false); // 🔥 update state to re-render
      setUserData({});
      setHistoryData([]); // optional: clear history too
      // navigate("/"); // optional: redirect to home/login page
    } catch (err) {
      console.log("Logout error", err);
    }
  };

  return (
    <div className="home-container">
      <div className="sidebar">
        <div className="logo" onClick={()=>navigate("/home")}><img src="op1.png" alt="icon" />Lucid Talk</div>
        
        <button onClick={() => navigate("/videoConference")}>
          Start a 1:1 Meeting
        </button>
        <button onClick={() => navigate("/history")}>History</button>
        {!isLogged && <button onClick={() => navigate("/login")}>Login / Signup</button>}
        {isLogged && <button onClick={logout}>LogOut</button>}
      </div>
      <div className="content">
        <div className="welcome-box">
          {isLogged === null ? (
            <h2>Checking login status...</h2>
          ) : isLogged ? (
            <h1>Welcome, {userData.username} 👋</h1>
          ) : (
            <h1>Please Login or SignUp to get started!</h1>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
