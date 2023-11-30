const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

//connecting to MongoDB
const mongoose = require('mongoose');
const uri = 'mongodb+srv://qotibaeiad98:qXtDQRbLen4VuKmX@bringcluster.whyyvg3.mongodb.net/?retryWrites=true&w=majority';
async function connect(){
    try{
await mongoose.connect(uri);
console.log('server has been connected to MongoDB');
    }catch(error){
        console.error(error);
    }
}
connect();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
var cnt = 0;

io.on('connection', (socket) => {
    // Generate a unique identifier for each client
    const clientId = generateUniqueId();
    
    console.log(`Client connected with ID ${clientId}`);
    
    socket.on('message', (data) => {
        console.log(`Message from client ${clientId}: ${data}`);
        // Emit the message only to the client that sent it
        socket.emit('message', "I receive the message");
    });

    socket.on('disconnect', () => {
        console.log(`Client with ID ${clientId} disconnected`);
        var client1 = { id: clientId, time: new Date().getDate() };
        console.log(client1);
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
    console.log('Hi, I am the server');
    console.log(`Server running at http://0.0.0.0:${PORT}`);
});

function generateUniqueId() {
    return Math.random().toString(36).substr(2, 9);
}
