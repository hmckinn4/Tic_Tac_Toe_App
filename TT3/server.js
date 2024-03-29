// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const Redis = require('redis');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const redisClient = Redis.createClient();

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('moveMade', async (data) => {
        await redisClient.hSet('gameState', data.cell, data.player);
        io.emit('moveMade', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
