import { Socket,Server } from "socket.io"

const Messaging=(server)=>{
    const io=new Server(server,{
        cors:{
            origin:"http://localhost:5173",
            methods:["GET","POST"],
            allowedHeaders:["*"],
            credentials:true
        }
    });
    io.use((socket, next) => {
      const userId = socket.handshake.auth.userId;
      if (!userId) return next(new Error('Unauthorized'));
      socket.userId = userId;
      next();
    });
    const onlineUsers=new Map();
    io.on("connection", (socket) => {
      // Track connected users
      onlineUsers.set(socket.userId, socket.id);
        
      // Handle private chat messages
      socket.on("private-message", async ({ to, message }) => {
        const receiverSocketId = onlineUsers.get(to);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("private-message", {
            from: socket.userId,
            message,
          });
        }
      });
  
      // Handle WebRTC signaling: Offer
      socket.on("call-user", ({ to, offer }) => {
        const receiverSocketId = onlineUsers.get(to);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("call-user", {
            from: socket.userId,
            offer,
          });
        }
      });
  
      // Handle WebRTC signaling: Answer
      socket.on("call-accepted", ({ to, answer }) => {
        const callerSocketId = onlineUsers.get(to);
        if (callerSocketId) {
          io.to(callerSocketId).emit("call-accepted", {
            from: socket.userId,
            answer,
          });
        }
      });
  
      // Handle ICE candidates
      socket.on("ice-candidate", ({ to, candidate }) => {
        const targetSocketId = onlineUsers.get(to);
        if (targetSocketId) {
          io.to(targetSocketId).emit("ice-candidate", {
            from: socket.userId,
            candidate,
          });
        }
      });
  
      // Cleanup on disconnect
      socket.on("disconnect", () => {
        onlineUsers.delete(socket.userId);
      });
    });
    return io;
    
}
export default Messaging;