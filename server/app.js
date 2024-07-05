import express from 'express';
import { Server} from 'socket.io';
import {createServer} from 'http';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
 
const app = express();
const secret = "mahdi"



const server = createServer(app)
const io = new Server(server,{
  cors:{
    origin:"http://localhost:5173",
    methods:["GET","POST"],
    credentials:true
  }
});

const port = 3000;

app.use(cors());


app.get('/', (req, res) => {
  res.send('Hello, World!');
})

app.get("/login",(req,res)=>{
  const user = {
    id:1,
    username:"admin"
  }
  const token = jwt.sign(user, secret);
  res.cookie("token",token, {httpOnly:true,secure:true,sameSite:"none"}).json({
    message:"Login Successfully",
    token:token
  })
})

io.use((socket, next) => {
  cookieParser()(socket.request, socket.request.res, (err)=>{
    if (err) {
      return next(err);
    }
    const token = socket.request.cookies.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }
    let decoded = jwt.verify(token, secret);
    next();
  })
})

io.on('connection', (socket) => {
  console.log("New User Connected Id : ");

  socket.on('message', (data) => {
    console.log(socket.id, data);
    io.to(data.room).emit("receive-message", `${data.message}`);
  });

  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`User with ID: ${socket.id} joined room: ${room}`);
  })

  socket.on('disconnect', () => {
    console.log('User Disconnected');
  });

});


server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
})

