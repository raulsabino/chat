const express = require('express');
const http = require('http');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();
const { Server } = require('socket.io');
const Message = require('./models/Messages'); // Assuming this is the correct path

// Constants
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'https://mystimessage.onrender.com',
    methods: ["GET", "POST"]
  }
});
const port = 8080;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Rooms
let rooms = {};

// Middleware
app.use(cors());

// Routes
// Route for searching GIFs
app.get('/search-gifs', async (req, res) => {
    const searchQuery = req.query.q;
    const GIPHY_API_KEY = process.env.GIPHY_API_KEY;
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${searchQuery}&limit=10`;
    
    try {
        const response = await axios.get(url);
        res.json(response.data.data);
    } catch (error) {
        console.error('Error fetching GIFs:', error);
        res.status(500).send('Error fetching GIFs');
    }
});

// WebSocket Events
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", async (data) => {
    const { room, username } = data;

    // Check if the username is already in use in the room
    if (rooms[room] && rooms[room].some(user => user.username === username)) {
      socket.emit("join_error", "Username is already taken in this room");
      return;
    }

    rooms[room] = rooms[room] || [];
    rooms[room].push({ id: socket.id, username });
    socket.join(room);
    io.to(room).emit("update_user_list", rooms[room]);

    try {
      const messages = await Message.find({ room });
      socket.emit("previous_messages", messages);
    } catch (err) {
      console.error('Error fetching previous messages:', err);
    }
    
    console.log(`User with ID: ${socket.id} joined room: ${room}`);
  });

  socket.on("send_message", async (data) => {
    socket.to(data.room).emit("receive_message", data);
    try {
      await new Message(data).save();
    } catch (err) {
      console.error('Error saving message:', err);
    }    
  });

  socket.on("leave_room", (room) => {
    // Function to remove the user from the room array
    const removeUserFromRoom = (userArray, userId) => {
      return userArray.filter(user => user.id !== userId);
    };

    // Check if the room exists
    if (rooms[room]) {
      // Remove the user from the room
      rooms[room] = removeUserFromRoom(rooms[room], socket.id);

      // Emit the updated user list to all clients in the room
      io.to(room).emit("update_user_list", rooms[room]);

      // If the room is now empty, you can optionally delete it
      if (rooms[room].length === 0) {
        delete rooms[room];
      }

      // Finally, have the socket leave the room
      socket.leave(room);
    }

    console.log(`User with ID: ${socket.id} left room: ${room}`);
  });

  socket.on("disconnect", () => {
    Object.keys(rooms).forEach(room => {
      rooms[room] = rooms[room].filter(user => user.id !== socket.id);
      io.to(room).emit("update_user_list", rooms[room]);
    });
    console.log("User Disconnected", socket.id);
  });
});

// Start server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});