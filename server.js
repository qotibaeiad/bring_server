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
// Define a Mongoose schema for the Item model
const itemSchema = new mongoose.Schema({
    url: String,
    desc: String,
    price: String,
    category: String,
    quant: String,
    shop: String,
});

// Create and export the User model
const User = mongoose.model('User', userSchema);
module.exports = User;

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;

// Connecting to MongoDB
const uri = "mongodb+srv://qotibaeiad11:qCncRQXjKh9UvEYx@bringy.z08amgt.mongodb.net/bringy?retryWrites=true&w=majority";

async function connect() {
    try {
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Server has been connected to MongoDB');
    } catch (error) {
        console.error(error);
    }
}

connect();



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
        await saveToCollection(socket, userData, 'User', User);
        //sendSMS();
    });

    socket.on('addItem', async (itemData) => {
        console.log(itemData);
        await saveToCollection(socket, itemData, 'Item', Item);
    });

    socket.on('ExistUser', async (userData) => {
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



async function saveToCollection(socket, data, collectionName, Model) {
    try {
        // Check if the data already exists
        //const dataExists = await isDataExists(data, Model);
        dataExists=false;
        if (dataExists) {
            // Emit an error message back to the client
            socket.emit(`${collectionName}AddedError`, `${collectionName} with this data already exists`);
            return;
        }

        const newData = new Model(data);

        // Save the new data to MongoDB
        await newData.save();

        console.log(`${collectionName} added to MongoDB: ${JSON.stringify(newData)}`);

        // Emit a success message back to the client
        socket.emit(`${collectionName}Added`, `${collectionName} added to MongoDB successfully`);
    } catch (error) {
        console.error(`Error adding ${collectionName} to MongoDB:`, error);
        // Emit an error message back to the client
        socket.emit(`${collectionName}AddedError`, `Error adding ${collectionName} to MongoDB`);
    }
}

async function isDataExists(data, Model) {
    try {
        // Check if the data already exists in the collection
        const existingData = await Model.findOne(data);

        return !!existingData; // Return true if data exists, false otherwise
    } catch (error) {
        console.error('Error checking data existence:', error);
        return false; // Return false in case of an error
    }
}