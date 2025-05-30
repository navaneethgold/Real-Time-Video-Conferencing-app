import express from 'express';
import {createServer} from "node:http";
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import passport from 'passport';
import localStrategy from 'passport-local';
import session from 'express-session';
import cors from 'cors';
const app=express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get("/home",(req,res)=>{
    return res.send("Hello world");
})
app.listen("8000",()=>{
    console.log("server is running on port 8000");
})
