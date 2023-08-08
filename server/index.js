const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const port = 3001;

app.use(cors());

const { Server } = require('socket.io');

const server = http.createServer(app);

const io = new Server(server, {
  cors : {
    origin: 'http://localhost:3000',
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", (data) => {
    socket.join(data);
  })
  socket.on("disconnect", () => {
    console.log("User", socket.id, "has disconnected")
  });
});

server.listen(port, () => {
  console.log('server is running on port', port)
})