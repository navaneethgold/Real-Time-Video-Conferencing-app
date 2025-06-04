import { useState,useEffect,useRef } from "react";
import io from 'socket.io-client';
import { Badge, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'

const server_url=`${import.meta.env.VITE_API_BASE_URL}`;
var connections={};
const peerConfigConnections={
    "iceServers":[
        {"urls": "stun:stun.l.google.com:19302"}
    ]
}

export default function VideoMeetComponent(){
    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(true);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(3);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([])

    let [videos, setVideos] = useState([])

    useEffect(()=>{
        console.log("Hello");
        getPermissions();
    })
    let getDisplayMedia=()=>{
        if(screen){
            if(navigator.mediaDevices.getDisplayMedia){
                navigator.mediaDevices.getDisplayMedia({video:true,audio:true})
                    .then(getDisplayMediaSuccess)
                    .then((stream)=>{ })
                    .catch((e)=>console.log(e))
            }
        }
    }
    const getPermissions=async()=>{
        try{
            const videoPermission=await navigator.mediaDevices.getUserMedia({video:true});
            if(videoPermission){
                setVideoAvailable(true);
                console.log("Video permission granted");
            }else{
                setVideoAvailable(false);
                console.log('Video permission denied');
            }

            const audioPermission=await navigator.mediaDevices.getUserMedia({audio:true});
            if(audioPermission){
                setAudioAvailable(true);
                console.log("Audio permission granted");
            }else{
                setAudioAvailable(false);
                console.log('Audio permission denied');
            }
            if(navigator.mediaDevices.getUserMedia){
                setScreenAvailable(true)
            }else{
                setScreenAvailable(false);
            }
            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = userMediaStream;
                    }
                }
            }
        }catch(error){
            console.log(error);
        }
    };
    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
            console.log("SET STATE HAS ", video, audio);

        }
    }, [video, audio])

    let getMedia=()=>{
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }
    

}