import { Socket,Server } from "socket.io"

const Messaging=(server)=>{
    const io=new Server(server,{
        cors:{
            origin:"https://real-time-video-conferencing-app.vercel.app/home",
            methods:["GET","POST"],
            allowedHeaders:["*"],
            credentials:true
        }
    });
    io.use((socket, next) => {
      const userId = socket.handshake.auth.userId;
      console.log(userId);
      if (!userId) return next(new Error('Unauthorized'));
      socket.userId = userId;
      next();
    });
    const onlineUsers=new Map();
    io.on("connection", (socket) => {
      // Track connected users
      onlineUsers.set(socket.userId, socket.id);

      // Handle private chat messages
      
      socket.on("join-room", ({ roomId }) => {
        socket.join(roomId);
        console.log(`User ${socket.userId} joined room ${roomId}`);
        socket.to(roomId).emit("user-joined");
      });
      socket.on("join-room-2", ({ roomId }) => {
        console.log(`User ${socket.userId} joined room 2 ${roomId}`);
        socket.join(roomId);
      });
      
      socket.on("private-message", async ({ roomId, message,un }) => {
        // const receiverSocketId = onlineUsers.get(to);
        // if (receiverSocketId) {
          io.to(roomId).emit("private-message", {
            roomId,
            message,
            un,
          });
        // }
      });
      socket.on("call-user", ({ roomId, offer }) => {
        socket.to(roomId).emit("call-user", { offer });
      });
      
      socket.on("videoOff",({roomId,videoOff})=>{
        socket.to(roomId).emit("videoOff",{roomId,videoOff});
      })

      socket.on("call-accepted", ({ roomId, answer }) => {
        socket.to(roomId).emit("call-accepted", { answer });
      });
      
      socket.on("ice-candidate", ({ roomId, candidate }) => {
        socket.to(roomId).emit("ice-candidate", { candidate });
      });
      
      socket.on("end-call", ({ roomId }) => {
        socket.to(roomId).emit("end-call");
      });
    });
    return io;
    
}
export default Messaging;