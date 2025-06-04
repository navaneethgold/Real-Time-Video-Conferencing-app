import express from 'express';
import {createServer} from "node:http";
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import passport from 'passport';
import localStrategy from 'passport-local';
import session from 'express-session';
import { error } from 'node:console';
import dotenv from "dotenv";
import user from './models/user.js';
import meeting from "./models/meeting.js";
import msg from "./models/message.js";
import Messaging from './controllers/messageSocket.js';
dotenv.config();
const app=express();
const server=createServer(app);
Messaging(server);
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.set("trust proxy", 1);
const sessionOptions = {
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "none",
    secure: true, // safer for local testing
    domain: "Lucid-Talk.onrender.com", // ✅ backend domain
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};
const allowedOrigins=[
    "http://localhost:5173",
    "https://Lucid-Talk.onrender.com",
    "https://Lucid-Talk.vercel.app"
];
app.use(cors({
    origin: (origin, callback) => {
    console.log("CORS request from:", origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}))
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

const dburl=process.env.MONGO_URI;

main().then(()=>{
    console.log("Connected-Successfully");
}).catch((error)=>{
    console.log("Not-Connected");
    console.log(error);
})
async function main(){
    await mongoose.connect(dburl);
}


app.post("/signup",async(req,res)=>{
    let{username,password}=req.body;
    const usern=await user.findOne({username:username});
    let new_user="";
    if(usern){
        return res.json({err:"user already exists"});
    }else{
        new_user=new user({username:username});
    }
    const registered_user=await user.register(new_user,password);
    req.login(registered_user,(err)=>{
        if(err){
            return next(err);
        }
        res.json(new_user);
    });
})


app.get("/check-Auth",(req,res)=>{
    if(req.isAuthenticated()){
        res.json({isAuthenticated:true,user:req.user})
    }else{
        res.json({isAuthenticated:false});
    }
})

app.post("/login",passport.authenticate("local",{failureRedirect:"/login"}),async(req,res)=>{
    try{
        if(req.isAuthenticated()){
            res.json(req.user);
        }
    }catch (error) {
        console.log("error logging in:",error);
        res.status(500).json({ success: false, error: error.message });
    }
})

app.get("/getID/:username",async(req,res)=>{
    const {username}=req.params;
    console.log("here");
    try{
        const tuser=await user.findOne({username:username});
        if (!tuser) {
            return res.json({ error: "User does not exist",exist:false });
        }
        res.json({tarUser:tuser._id,exist:true});
    }catch(error){
        console.log("Error: ",error);
    }
})

app.post("/newMeeting",async(req,res)=>{
    try{
        let meeting1=await meeting.findOne({roomId:req.body.roomId,endTime:{$ne:null}});
        if(meeting1) return res.json({err:"Meeting Id already used"})
        let newMeet=new meeting({
            generatedBy:req.body.generatedBy,
            roomId:req.body.roomId
        });
        await newMeet.save();
        return res.json({ message: "Meeting created successfully" });
    }catch(err){
        console.log("error",err);
    }
})

app.put("/endMeeting", async (req, res) => {
  try {
    const exist = await meeting.find({ roomId: req.body.roomId });

    if (exist.length === 0) {
      return res.status(404).json({ err: "Meeting not found" });
    }
    
    for (const e of exist) {
      e.endTime = Date.now();  // Call it as a function
      await e.save();
    }

    res.status(200).json({ message: "Meeting ended successfully" });
  } catch (err) {
    console.log("error", err);
    res.status(500).json({ err: "Internal server error" });
  }
});

app.get("/fetchHistory", async (req, res) => {
  try {
    // Step 1: Get all meetings created by this user, sorted by roomId
    const allHistory = await meeting.find({ generatedBy: req.user.username })
      .sort({ StartTim: -1 });

    // Step 2: Extract roomIds from those meetings
    const roomIds = allHistory.map(meet => meet.roomId);

    // Step 3: Get related meetings with same roomIds, but from other users, sorted by roomId
    const relatedMeetings = await meeting.find({ 
      roomId: { $in: roomIds },
      generatedBy: { $ne: req.user.username }
    }).sort({ StartTim: -1 });

    res.json({ yourMeetings: allHistory, othersInSameRooms: relatedMeetings });
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ err: "Internal server error" });
  }
});

app.post('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) return res.status(500).json({ error: "Logout failed" });
    res.clearCookie("connect.sid"); // Optional: clear session cookie
    res.json({ message: "Logged out" });
  });
});

app.get("/home",(req,res)=>{
    return res.send("Hello world");
})
server.listen("8000",()=>{
    console.log("server is running on port 8000");
})
