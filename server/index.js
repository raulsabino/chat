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
    origin: 'http://localhost:3000',
    methods: ["GET", "POST"]
  }
});
const port = 3001;

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