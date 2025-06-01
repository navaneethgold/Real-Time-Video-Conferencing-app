import mongoose, { Schema } from "mongoose";

const message=new mongoose.Schema({
    senderId:{type:Schema.Types.ObjectId,required:true},
    receiverId:{type:Schema.Types.ObjectId,required:true},
    message:{type:String,required:true},
    timeStamp:{type:Date,default:Date.now}
})

const msg=mongoose.model("msg",message);
export default msg; 