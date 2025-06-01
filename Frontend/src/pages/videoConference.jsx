import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const MeetVideo = () => {
  const peerConnection = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const targetUserIdRef = useRef(null);
  const [targetUser, setTargetUser] = useState("");
  const [message, setMessage] = useState("");
  const [userData, setUserData] = useState({});
  const [isReady, setIsReady] = useState(false);
  const navigate = useNavigate();

  // Step 1: Check Auth and then setup
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("http://localhost:8000/check-Auth", {
          withCredentials: true,
        });
        if (res.data.isAuthenticated) {
          setUserData(res.data.user);
          setIsReady(true);
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error("Auth check failed", err);
        navigate("/login");
      }
    };
    checkAuth();
  }, []);

  // Step 2: Setup socket and peer connection after refs + user are ready
  useEffect(() => {
    if (!isReady || !userData._id || !localVideoRef.current) return;

    // Initialize socket
    socketRef.current = io("http://localhost:8000", {
      auth: { userId: userData._id },
      withCredentials: true,
    });

    // Initialize peer connection
    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // Stream local video
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach((track) =>
          peerConnection.current.addTrack(track, stream)
        );
      } catch (err) {
        console.error("Media error:", err);
      }
    };

    startMedia();

    // Handle incoming call
    socketRef.current.on("call-user", async ({ from, offer }) => {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socketRef.current.emit("call-accepted", { to: from, answer });
    });

    // Handle answer
    socketRef.current.on("call-accepted", async ({ answer }) => {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    // Handle ICE candidate from other peer
    socketRef.current.on("ice-candidate", ({ candidate }) => {
      peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
    });

    // Send ICE candidate
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate && targetUserIdRef.current) {
        socketRef.current.emit("ice-candidate", {
          to: targetUserIdRef.current,
          candidate: event.candidate,
        });
      }
    };

    // Set remote video
    peerConnection.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    return () => {
      socketRef.current?.disconnect();
    };
  }, [isReady, userData._id]);

  const createOffer = async (targetUserId) => {
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    socketRef.current.emit("call-user", { to: targetUserId, offer });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`http://localhost:8000/getID/${targetUser}`);
      if (res.data.exist) {
        targetUserIdRef.current = res.data.tarUser;
        createOffer(targetUserIdRef.current);
      } else {
        alert("User doesn't exist");
      }
    } catch (err) {
      console.error("Error fetching target user ID", err);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="messageBox">
          <input type="text" value={targetUser} onChange={(e) => setTargetUser(e.target.value)} required />
          <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} required />
        </div>
        <button type="submit">Send</button>
      </form>
      <video ref={localVideoRef} autoPlay playsInline muted style={{ width: "300px" }} />
      <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "300px" }} />
    </>
  );
};

export default MeetVideo;
