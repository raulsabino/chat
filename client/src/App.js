import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Chat from './Chat';
import "./style.css";
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ColorPicker from './ColorPicker';

const socket = io.connect("https://mystimessage-server.onrender.com");

const App = () => {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  useEffect(() => {
    socket.on('join_error', (errorMessage) => {
      alert(errorMessage); // Or use a more sophisticated way to display the error
      resetLoginState();
    });
  
    // Clean up to avoid memory leaks and multiple listeners
    return () => {
      socket.off('join_error');
    };
  }, [socket]);

  // This functions allows the user to join
  const joinRoom = () => {
    if (username !== "" && room !== "") {

      if (username.length > 12) {
        alert(`Username must be less than ${12 + 1} characters.`);
        return;
      }

      socket.emit("join_room", { room, username });
      setShowChat(true);
    }
  };

  // This function resets the user so he doesn't re-loggin
  const resetLoginState = () => {
    setShowChat(false);
    setUsername("");
    setRoom("");
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
      <div className="theme-container" onClick={() => setIsColorPickerOpen(prevState => !prevState)}>
        {isColorPickerOpen ? <CloseIcon /> : <PaletteOutlinedIcon />}
      </div>
      <ColorPicker
        isOpen={isColorPickerOpen}
      />
    </div>
  );

  return (
    <div className="App">
      {!showChat ? renderLoginForm() : <Chat socket={socket} username={username} room={room} resetLoginState={resetLoginState}/>}
    </div>
  );
};

export default App;