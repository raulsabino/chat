import React, { useState, useEffect } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import ScrollToBottom from "react-scroll-to-bottom";

const Chat = ({ socket, username, room }) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const sendMessage = async () => {
    if (currentMessage !== "") {
        const now = new Date(Date.now());
        let hours = now.getHours();
        let minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        const timeStr = hours + ':' + minutes + ' ' + ampm;

        const messageData = {
            room: room,
            author: username,
            message: currentMessage,
            time: timeStr
        };
        
        await socket.emit("send_message", messageData);
        setMessageList((list) => [...list, messageData]);
        setCurrentMessage("");
    }
};

  useEffect(() => {
    const receiveMessage = (data) => {
      setMessageList((list) => [...list, data]);
    };

    socket.on("receive_message", receiveMessage);

    // Cleanup listener on component unmount
    return () => {
        socket.off("receive_message", receiveMessage);
    };
  }, []);



  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="input">
          <TextField
              placeholder='Search...'
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
        </div>
        <div className="profiles-holder">
          <div className="profile-pic">
            <img src="https://secure.gravatar.com/avatar/dbae6a6fd43a7ec6ffcc2f02a0092e28.jpg?s=192&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0007-192.png" alt="pfp" />
          </div>
          <h2>John</h2>
        </div>
        <div className="profiles-holder">
          <div className="profile-pic">
            <img src="https://secure.gravatar.com/avatar/dbae6a6fd43a7ec6ffcc2f02a0092e28.jpg?s=192&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0007-192.png" alt="pfp" />
          </div>
          <h2>James</h2>
        </div>
        <div className="profiles-holder">
          <div className="profile-pic">
            <img src="https://secure.gravatar.com/avatar/dbae6a6fd43a7ec6ffcc2f02a0092e28.jpg?s=192&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0007-192.png" alt="pfp" />
          </div>
          <h2>Joe</h2>
        </div>
      </div>
      <div className="chat-header">
        <h1>Live chat</h1>
      </div>
      <div className="body-container">
        <div className="chat-body">
          <ScrollToBottom className='message-container'>
            {messageList.map((messageContent) => {
              return <div 
                className="messages"
                id={username === messageContent.author ? "you" : "other"}
              >
                <div className="message-content">
                  <p>{messageContent.message}</p>
                </div>
                <div className="message-meta">
                  <p>Sent {messageContent.time}</p>
                </div>
              </div>
            })}
          </ScrollToBottom>
        </div>
        <div className="chat-footer">
        <TextField 
          fullWidth
          value={currentMessage}
          placeholder='Message...' 
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyDown={(event) => {
            if(event.key === 'Enter') {
              sendMessage();
              event.preventDefault();  // Prevents the default action (form submission, newline, etc.)
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <div className="send-button-wrapper">
                  <IconButton 
                    onClick={sendMessage}
                    disableFocusRipple
                    disableRipple
                  >
                    <SendRoundedIcon />
                  </IconButton>
                </div>
              </InputAdornment>
            ),
          }}
          />
        </div>
      </div>
    </div>
  )
}

export default Chat