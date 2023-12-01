const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

// Define a Mongoose schema for the User model
const userSchema = new mongoose.Schema({
    name: String,
    phoneNumber: String,
});

// Create and export the User model
const User = mongoose.model('User', userSchema);
module.exports = User;

// Connecting to MongoDB
const uri = 'mongodb+srv://qotibaeiad98:qXtDQRbLen4VuKmX@bringcluster.whyyvg3.mongodb.net/bring?retryWrites=true&w=majority';

async function connect() {
    try {
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Server has been connected to MongoDB');
    } catch (error) {
        console.error(error);
    }
}

connect();

// Define a Mongoose schema for the Message model
const messageSchema = new mongoose.Schema({
    request: String,
    time: String,
});

const Message = mongoose.model('Message', messageSchema);

const app = express();
const cors = require('cors');
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
    // Generate a unique identifier for each client
    const clientId = generateUniqueId();

    console.log(`Client connected with ID ${clientId}`);

    socket.on('addUser', async (userData) => {
        const newUser = new User({
                    name: userData.name,
                    phoneNumber: userData.phoneNumber,
                });
        if (userData && userData.name && userData.phoneNumber) {
            try {
                
                const newUser = new User({
                    name: userData.name,
                    phoneNumber: userData.phoneNumber,
                });
                // Save the new user to MongoDB
                await newUser.save();
    
                console.log(`User added to MongoDB: ${JSON.stringify(newUser)}`);
    
                // Emit a success message back to the client
                socket.emit('userAdded', 'User added to MongoDB successfully');
            } catch (error) {
                console.error('Error adding user to MongoDB:', error);
                // Emit an error message back to the client
                socket.emit('userAddedError', 'Error adding user to MongoDB');
            }
        } else {
            // Emit an error message back to the client if 'userData' is not formatted correctly
            socket.emit('userAddedError', 'Invalid user data');
        }
    });

    // ... (rest of your socket event handlers)

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
