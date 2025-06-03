import mongoose from "mongoose";
const meetingSchema=new mongoose.Schema({
    generatedBy:{type:String,required:true},
    joinedBy:{type:String},
    roomId:{type:String,required:true},
    StartTime:{type:Date,default:Date.now,required:true},
    endTime:{type:Date}
});
const meeting=mongoose.model("meeting",meetingSchema);
export default meeting;