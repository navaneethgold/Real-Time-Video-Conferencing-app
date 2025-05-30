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
const app=express();
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
        return res.status(400).send("username already exists");
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


app.get("/home",(req,res)=>{
    return res.send("Hello world");
})
app.listen("8000",()=>{
    console.log("server is running on port 8000");
})
