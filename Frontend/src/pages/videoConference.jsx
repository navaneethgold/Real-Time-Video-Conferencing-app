import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "../Styles/videoConference.css";
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import Chatting from "./chatting";
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import VideocamOffRoundedIcon from '@mui/icons-material/VideocamOffRounded';
import CallEndRoundedIcon from '@mui/icons-material/CallEndRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import MicOffRoundedIcon from '@mui/icons-material/MicOffRounded';


const MeetVideo = () => {
  const peerConnection = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const [roomId, setRoomId] = useState("");
  const [userData, setUserData] = useState({});
  const [isReady, setIsReady] = useState(false);
  const navigate = useNavigate();
  const [isRemoteVideoOff, setIsRemoteVideoOff] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const localStreamRef = useRef(null);
  const [ischatOpen,setIsChatOpen]=useState(false);

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

  useEffect(() => {
    if (!isReady || !userData._id || !localVideoRef.current) return;

    socketRef.current = io("http://localhost:8000", {
      auth: { userId: userData._id },
      withCredentials: true,
    });

    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

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
        localStreamRef.current =stream;
      } catch (err) {
        console.error("Media error:", err);
      }
    };

    startMedia();

    socketRef.current.on("user-joined", async () => {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socketRef.current.emit("call-user", { roomId, offer });
      setInCall(true);
    });

    socketRef.current.on("call-user", async ({ offer }) => {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socketRef.current.emit("call-accepted", { roomId, answer });
      setInCall(true);
    });

    socketRef.current.on("call-accepted", async ({ answer }) => {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socketRef.current.on("ice-candidate", ({ candidate }) => {
      peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socketRef.current.on("end-call", () => {
      endCallForMe();
    });
    socketRef.current.on("videoOff",({roomId,videoOff})=>{
      setIsRemoteVideoOff(!videoOff);
    })

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice-candidate", {
          roomId,
          candidate: event.candidate,
        });
      }
    };

    peerConnection.current.ontrack = (event) => {
      const stream = event.streams[0];
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      
        const [remoteVideoTrack] = stream.getVideoTracks();
        // if (remoteVideoTrack) {
        //   // Listen for enabled/disabled change
        //   remoteVideoTrack.onmute = () => setIsRemoteVideoOff(true);
        //   remoteVideoTrack.onunmute = () => setIsRemoteVideoOff(false);
        //   // Initial state
        //   // setIsRemoteVideoOff(!remoteVideoTrack.enabled);
        // }
      }
    };


    return () => {
      socketRef.current?.disconnect();
    };
  }, [isReady, userData._id, roomId]);

  function generateRoomId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for(let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    console.log("result: ",result);
    setRoomId(result);
    socketRef.current.emit("join-room", { roomId:result });
  }
  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!roomId.trim()) return alert("Enter a room ID");
    socketRef.current.emit("join-room", { roomId });
  };

  const endCall = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    socketRef.current.emit("end-call", { roomId });
    setInCall(false);
  };

  const endCallForMe = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setInCall(false);
  };
  const toggleMute = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setVideoOff(!videoTrack.enabled);
      socketRef.current.emit("videoOff",{roomId,videoOff});
    }
  };
  

  return (
    <>
    <div className="lobby">
      {!inCall && 
        <form onSubmit={handleJoinRoom} id="joinroom">
          <div className="jr">
              <input type="text" placeholder="Enter Room ID" value={roomId} onChange={(e) => setRoomId(e.target.value)} required />
              <button type="submit">Join Room</button>
          </div>
          <div className="start-ins" onClick={() => generateRoomId()}>Generate a RoomID</div>
        </form>}
        {videoOff && <div className="video-overlay">Video Off</div>}
        <video ref={localVideoRef} autoPlay playsInline muted id="local" />
        {isRemoteVideoOff && <div className="video-overlay2">Video Off</div>}
        <video ref={remoteVideoRef} autoPlay playsInline id="remote" />
        <Chatting roomId={roomId}/>
        {inCall && (
          <div className="buttons">
            <button onClick={toggleMute} className="icon-btn">
              {isMuted ? <MicOffRoundedIcon /> : <MicRoundedIcon />}
            </button>
            <button onClick={toggleVideo} className="icon-btn">
              {videoOff ? <VideocamOffRoundedIcon /> : <VideocamRoundedIcon />}
            </button>
            <button className="icon-btn">
              <ChatRoundedIcon onClick={() => setIsChatOpen(prev => !prev)}/> 
            </button>
            <button onClick={endCall} className="end-call-btn">
              <CallEndRoundedIcon />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default MeetVideo;
