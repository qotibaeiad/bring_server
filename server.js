const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');


//sms twilio sms sender
const accountSid = 'ACd16ecac30c5367a9e3af753a3c63b0a3';
const authToken = 'ecc5da01365fa5b0090045be031cbc41';
const twilioPhoneNumber = '+14055710130';

const client = require('twilio')(accountSid, authToken);

// Function to send an SMS

const { Vonage } = require('@vonage/server-sdk')

const vonage = new Vonage({
  apiKey: "722471db",
  apiSecret: "u1FHKKDoPAWdjyvI"
})

const from = "722471db"
const to = "+972546599222"
const text = 'A text message sent using the Vonage SMS API'

async function sendSMS() {
    await vonage.sms.send({to, from, text})
        .then(resp => { console.log('Message sent successfully'); console.log(resp); })
        .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
}
  


// Define a Mongoose schema for the User model
const userSchema = new mongoose.Schema({
    name: String,
    phoneNumber: String,
});

// Create and export the User model
const User = mongoose.model('User', userSchema);
module.exports = User;

// Connecting to MongoDB
const uri = "mongodb+srv://qotibaeiad11:qCncRQXjKh9UvEYx@bringy.z08amgt.mongodb.net/?retryWrites=true&w=majority";

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
        //sendSMS('+972546599222', 'Hello, this is a test SMS from Twilio!');
        sendSMS();
        await SaveUser(socket, userData); // Pass 'socket' and 'userData' to the SaveUser function
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




async function SaveUser(socket, userData) {
    if (userData && userData.name && userData.phoneNumber) {
        // Check if the user already exists
        const userExists = await isUserExists(userData.phoneNumber);

        if (userExists) {
            // Emit an error message back to the client
            socket.emit('userAddedError', 'User with this phone number already exists');
            return;
        }

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
}


async function isUserExists(phoneNumber) {
    try {
        const existingUser = await User.findOne({ phoneNumber: phoneNumber });

        return !!existingUser; // Return true if user exists, false otherwise
    } catch (error) {
        console.error('Error checking user existence:', error);
        return false; // Return false in case of an error
    }
}




/*
async function sendSMS(to, message) {
    try {
        const result = await client.messages.create({
            body: message,
            from: twilioPhoneNumber,
            to: to
        });

        console.log(`SMS sent with SID: ${result.sid}`);
    } catch (error) {
        console.error('Error sending SMS:', error);
    }
}
*/
// Example usage