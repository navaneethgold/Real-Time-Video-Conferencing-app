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
    io.on("connection",(socket)=>{
        onlineUsers.set(socket.userId,socket.id);
        socket.on("private-message",async({to,message})=>{
            const receiverSocketId=onlineUsers.get(to);
            if(receiverSocketId){
                io.to(receiverSocketId).emit("private-message",{
                    from:socket.userId,
                    message,
                });
            }
        })

        socket.on("disconnect",()=>{
            onlineUsers.delete(socket.userId);
        })
    })
    return io;
    
}
export default Messaging;