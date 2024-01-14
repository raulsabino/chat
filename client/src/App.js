// App.js
import React, { useState } from 'react';
import io from 'socket.io-client';
import Chat from './Chat';
import "./style.css";

const socket = io.connect("http://localhost:3001");

const App = () => {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", { room, username });
      setShowChat(true);
    }
  };

  const renderLoginForm = () => (
    <div className="container">
      <div className="join-container">
        <h1>Log in</h1>
        <input
          type="text"
          placeholder="Username..."
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="text"
          placeholder="Room ID..."
          onChange={(e) => setRoom(e.target.value)}
        />
        <button onClick={joinRoom}>Join</button>
      </div>
    </div>
  );

  return (
    <div className="App">
      {!showChat ? renderLoginForm() : <Chat socket={socket} username={username} room={room} />}
    </div>
  );
};

export default App;