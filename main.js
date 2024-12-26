const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const MongoDBManager = require('./MongoDBManager');
const VonageManager = require('./VonageManager');
const SocketConnectionManager = require('./SocketConnectionManager');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server);

const mongoDBManager = new MongoDBManager();
const vonageManager = new VonageManager(); 

mongoDBManager.setIo(io);
mongoDBManager.connect();

const socketConnectionManager = new SocketConnectionManager(io, mongoDBManager, vonageManager);

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
});
