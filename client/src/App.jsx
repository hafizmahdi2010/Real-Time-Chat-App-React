import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import "./App.css";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("");
  const [roomName, setRoomName] = useState("");
  const [userId, setIUserId] = useState("");

  useEffect(() => {
    const newSocket = io('http://localhost:3000',{
      withCredentials: true,
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('connected ', newSocket.id);
      setIUserId(newSocket.id);
    });

    newSocket.on("welcome", (data) => {
      console.log(data);
    });

    newSocket.on("receive-message", async (data) => {
      console.log("Recieved Message : ", data);
      setMessages((messages) => [...messages, data]);
    })

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (socket) {
      socket.emit("message", { message, room });
      setMessage("");
      setRoom("");
    }
  };

  const joinRoom = (e) =>{
    e.preventDefault();
    if (socket) {
      socket.emit("join-room",  roomName );
      setRoomName("");
    }
  }

  return (
    <>
      <h3 className='text-center text-blue-400 text-3xl my-3'>Send Message</h3>

      <form onSubmit={joinRoom} className='w-[70vw] mx-auto'>
        <h4>Join The Room</h4>
        <div className="flex items-center gap-[10px]">
        <input onChange={(e)=>setRoomName(e.target.value)} value={roomName} type="text" placeholder='Enter Room Name' className='border border-blue-400 p-2 flex-1'/>
        <button type='submit' className='bg-blue-400 text-white p-2 min-w-[120px]'>Join</button>
        </div>
      </form>

      <form onSubmit={handleSubmit} className='w-[70vw] mx-auto'>
        <h3 className='my-3 text-[gray]'><b className='text-[#000]'>User Id : </b>{userId}</h3>
        <input
          type="text"
          placeholder='Enter Message'
          className='border border-blue-400 p-2 w-full'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder='Enter Room Id'
          className='border border-blue-400 p-2 w-full mt-2'
          onChange={(e) => setRoom(e.target.value)}
          value={room}
          required
        />
        <button
          type="submit"
          className='bg-blue-400 text-white p-2 mt-3 min-w-[120px]'
        >
          Send
        </button>
      </form>

      {
        messages ? messages.map((message, index) => {
          return (
            <div key={index} className='w-[70vw] mx-auto mt-3'>
              <p className='text-[#000]'>
               <p><b>Message : </b>{message}</p>
              </p>
            </div>
          );
        }) : <>
          <p className='text-[#000]'>No Messages</p>
        </>
      }

    </>
  );
};

export default App;
