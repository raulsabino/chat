import React, { useState, useEffect } from 'react';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import ScrollToBottom from 'react-scroll-to-bottom';

const Chat = ({ socket, username, room, resetLoginState }) => {
  // State hooks for managing chat functionalities
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageList, setMessageList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [previewGif, setPreviewGif] = useState(null);
  const [gifResults, setGifResults] = useState([]);
  const [gifIndex, setGifIndex] = useState(0);

  // Utility function to format the time for messages
  const formatTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${minutes} ${ampm}`;
  };

  // Function to send a text message
  const sendMessage = async () => {
    if (currentMessage !== '' && !currentMessage.startsWith('/')) {
      const messageData = {
        room,
        author: username,
        message: currentMessage,
        time: formatTime(new Date(Date.now()))
      };

      if (previewGif) setPreviewGif(null);

      await socket.emit('send_message', messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage('');
    }
  };

  // Effect hook for setting up and cleaning up socket listeners
  useEffect(() => {
    socket.on('previous_messages', (messages) => setMessageList(messages));
    socket.on('receive_message', (data) => setMessageList((list) => [...list, data]));
    socket.on('update_user_list', (users) => setUserList(users));

    // Cleanup function to remove listeners on component unmount
    return () => {
      socket.off('receive_message');
      socket.off('update_user_list');
    };
  }, [socket]);

  // Handler for changes in the message input field
  const handleInputChange = (e) => {
    const input = e.target.value;
    setCurrentMessage(input);

    // Clear GIF previews when input is empty or remove '/' for GIF search
    if (input.trim() === '') {
      setPreviewGif(null);
      setGifResults([]);
    } else if (input.startsWith('/')) {
      searchGIFs(input.slice(1));
    } else {
      setGifResults([]);
    }
  };

  const searchGIFs = async (searchTerm) => {
    try {
      const response = await fetch(`http://localhost:3001/search-gifs?q=${searchTerm}`);
      const data = await response.json();
      setGifResults(data); // Save all the GIFs instead of a single random one
      setPreviewGif(data[gifIndex]); // Show the GIF at the current index
    } catch (error) {
      console.error('Error searching GIFs:', error);
    }
  };

  const shuffleGIF = () => {
    // Pick a random index in the gifResults array
    const randomIndex = Math.floor(Math.random() * gifResults.length);
    setGifIndex(randomIndex); // Update the gifIndex state
    setPreviewGif(gifResults[randomIndex]); // Set the preview GIF to the random one selected
  };

  const sendGIF = async () => {
    if (previewGif) {
      const now = new Date(Date.now());
      let hours = now.getHours();
      let minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
  
      hours = hours % 12;
      hours = hours ? hours : 12; 
      minutes = minutes < 10 ? '0' + minutes : minutes;
      const timeStr = hours + ':' + minutes + ' ' + ampm;
  
      const messageData = {
        room: room,
        author: username,  // This will ensure the correct username is sent
        message: previewGif.images.fixed_height.url,
        time: timeStr
    };
      
      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
      setPreviewGif(null);  // Clear the preview
    }
  }

  const isGifUrl = (url) => {
    const pattern = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/g;
    return pattern.test(url);
  };

  // leaves user from the room
  const leaveRoom = () => {
    socket.emit('leave_room', room);
    resetLoginState(); // This function will reset the state and show the login form
  };


  return (
    <div className="chat-container" tabIndex="0">
      <div className="chat-sidebar">
        <div className='chat-sidebar-container'>
          <h1>Users online</h1>
          {userList.map(user => (
            <div className="profile-holder" key={user.id}>
              <div className="profile-pic">
                <img src="https://secure.gravatar.com/avatar/dbae6a6fd43a7ec6ffcc2f02a0092e28.jpg?s=192&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0007-192.png" alt="pfp" />
              </div>
              <h2>{user.username}</h2>
            </div>
          ))}
        </div>
        <div className='back-button' onClick={leaveRoom}>Back</div>
      </div>
      <div className="chat-header">
        <h1>Live chat - {room}</h1>
      </div>
      <div className="body-container">
        <div className="chat-body">
          <ScrollToBottom className='message-container'>
            {messageList.map((messageContent) => {
              return (
                <div 
                  className="messages"
                  id={username === messageContent.author ? "you" : "other"}
                >
                  <div className="message-content">
                    {isGifUrl(messageContent.message) ? (
                      <img src={messageContent.message} alt="GIF" className="gif" />
                    ) : (
                      <p>{messageContent.message}</p>
                    )}
                  </div>
                  <div className="message-meta">
                    <p><b>{messageContent.author}</b> {messageContent.time}</p>
                  </div>
                </div>
              );
            })}

            {previewGif && (
              <div id="you">
                <div className="message-gif">
                  <img src={previewGif.images.fixed_height.url} alt={previewGif.title} className="gif" />
                </div>
                <div className='button-container'>
                  <button onClick={shuffleGIF} className="gif-button">Shuffle</button>
                </div>
              </div>
            )}
          </ScrollToBottom>
        </div>
        <div className="chat-footer">
          <TextField 
            fullWidth
            value={currentMessage}
            placeholder='Type "/" followed by your GIF search or write a message...' 
            onChange={handleInputChange}
            onKeyDown={(event) => {
              if(event.key === 'Enter') {
                if (previewGif) {
                  sendGIF();
                } else if (!currentMessage.startsWith("/")) {
                  sendMessage();
                }
                event.preventDefault();  // Prevents the default action (form submission, newline, etc.)
              }
            }}            
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <div className="send-button-wrapper">
                    <IconButton 
                      onClick={() => {
                        if (previewGif) {
                          sendGIF();
                        } else if (!currentMessage.startsWith("/")) {
                          sendMessage();
                        }
                      }}
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