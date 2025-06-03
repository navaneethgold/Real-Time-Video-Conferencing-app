import express from 'express';
import {createServer} from "node:http";
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import passport from 'passport';
import localStrategy from 'passport-local';
import session from 'express-session';
import { error } from 'node:console';
import user from './models/user.js';
import meeting from "./models/meeting.js";
import msg from "./models/message.js";
import Messaging from './controllers/messageSocket.js';
const app=express();
const server=createServer(app);
Messaging(server);
app.use(express.json());
app.use(express.urlencoded({extended:true}));
const sessionOptions={
    secret: "navaneeth1729",
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge:7*24*60*60*1000,
    },
};
const allowedOrigins=[
    "http://localhost:5173"
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

const dburl='mongodb+srv://navaneethabs2006:V9s22ZUtesUBf7xi@cluster0.wj001x8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

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


app.get("/home",(req,res)=>{
    return res.send("Hello world");
})
server.listen("8000",()=>{
    console.log("server is running on port 8000");
})
