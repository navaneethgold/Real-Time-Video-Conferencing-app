import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "../Styles/history.css";
const History=()=>{
  const [userData, setUserData] = useState({});
  const navigate = useNavigate();
  const [isLogged,setisLogged]=useState(false);
  const [historyData,setHistoryData]=useState([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("http://localhost:8000/check-Auth", {
          withCredentials: true,
        });
        if (res.data.isAuthenticated) {
          setUserData(res.data.user);
          setisLogged(true)
        }
      } catch (err) {
        console.error("Auth check failed", err);
      }
    };
    checkAuth();
  }, []);

    useEffect(()=>{
        const fetchHistory=async()=>{
            try{
                if(isLogged){
                    const res= await axios.get("http://localhost:8000/fetchHistory",{
                        withCredentials:true,
                    });
                    const combined=res.data.yourMeetings.map((meet)=>{
                        let otherOne=res.data.othersInSameRooms.find((match)=>
                            match.roomId===meet.roomId
                        );
                        return{
                            user:meet.generatedBy,
                            otherUser:!otherOne ? "-":otherOne.generatedBy,
                            roomId:meet.roomId,
                            startTime: new Date(meet.StartTime).toLocaleString(),
                            endTime: meet.endTime
                              ? new Date(meet.endTime).toLocaleString()
                              : "Ongoing",
                        }
                    })
                    setHistoryData(combined);
                }
                
            }catch(err){
                console.log("error",err)
            }
        }
        fetchHistory();
    },[isLogged]);
    
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

    return(
        <>
          <div className="topbar">
            <div className="icon" onClick={()=>navigate("/home")}>
              <img src="op1.png" alt="icon" />
              <h3>Welcome to lucid Talk</h3>
            </div>
            
              <div className="controls" onClick={() => navigate("/home")}>Home</div>
              <div className="controls" onClick={() => navigate("/videoConference")}>Start a new 1:1 Meeting</div>
              {isLogged && <div className="controls" onClick={logout}>LogOut</div>}
              {!isLogged && (
                <div className="tala"><span onClick={() => navigate("/login")}>Login/</span><span onClick={() => navigate("/signup")}>SignUp</span></div>
              )}
          </div>

          <h2 style={{ textAlign: "center", marginTop: "20px",color:"white" }}>Meeting History</h2>

          <div style={{ padding: "20px" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#f4f4f4",
              borderRadius: "10px",
              overflow: "hidden",
            }}>
              <thead style={{ backgroundColor: "#2c3e50", color: "white" }}>
                <tr>
                  <th style={cellStyle}>User</th>
                  <th style={cellStyle}>Other User</th>
                  <th style={cellStyle}>Room ID</th>
                  <th style={cellStyle}>Start Time</th>
                  <th style={cellStyle}>End Time</th>
                </tr>
              </thead>
              <tbody>
                {historyData.map((row, index) => (
                  <tr key={index} style={{ textAlign: "center", backgroundColor: index % 2 === 0 ? "#ecf0f1" : "#fff" }}>
                    <td style={cellStyle}>{row.user}</td>
                    <td style={cellStyle}>{row.otherUser}</td>
                    <td style={cellStyle}>{row.roomId}</td>
                    <td style={cellStyle}>{row.startTime}</td>
                    <td style={cellStyle}>{row.endTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>

    );
}
const cellStyle = {
  padding: "12px",
  border: "1px solid #ddd",
};
export default History;