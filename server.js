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


// Update setupChangeStream function
function setupChangeStream(Model, eventType, eventEmitter, eventName) {
    const changeStream = Model.watch();

    // Listen for 'change' events
    changeStream.on(eventType, (change) => {
        console.log(change);

        // Emit the change data to all connected clients
        // if want condition:-
        // if (change.operationType === 'insert' || change.operationType === 'delete') {

       // console.log(change);
        eventEmitter.emit(eventName, change);
    });

    // Handle any errors
    changeStream.on('error', (error) => {
        console.error('Change stream error:', error);
    });
}


// Update connect function to include setupChangeStream for User and Item collections
async function connect() {
    try {
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Server has been connected to MongoDB');

        // Set up a change stream for the Item collection
        setupChangeStream(Item, 'change', io, 'itemChange');
        // Set up a change stream for the User collection
        setupChangeStream(User, 'change', io, 'userChange');
        // Add more setupChangeStream calls for other models if needed
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


    // Use cursor() instead of stream()

    Item.find().cursor().eachAsync((item) => {
        socket.emit('streamitems', item);
        console.log(`qotiba: ${item.category}, mhamed: ${item.desc}`);
    });
    socket.on('addUser', async (userData) => {
        await saveToCollection(socket, userData, 'User', User);
        //sendSMS();
    });

    socket.on('addItem', async (itemData) => {
        //console.log(itemData);
        await saveToCollection(socket, itemData, 'Item', Item);
    });

    socket.on('getItems', async () => {
        try {
            const items = await Item.find({});
           // console.log(items);
            // Send the items to the client
            socket.emit('allItems', items);
        } catch (error) {
            console.error('Error fetching items from MongoDB:', error);
            // Emit an error message back to the client
            socket.emit('getItemsError', 'Error fetching items from MongoDB');
        }
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



async function saveToCollection(socket, data, collectionName, Model, eventName) {
    try {
        const filter = { /* define a unique filter for your data */ };
        const update = { $setOnInsert: data };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };

        // Try to find the existing data or insert the new data
        const result = await Model.findOneAndUpdate(filter, update, options);

        if (result) {
            // Existing data found, emit an error message back to the client
            socket.emit(`${collectionName}AddedError`, `${collectionName} with this data already exists`);
        } else {
            // New data added or existing data found
            socket.emit(`${collectionName}Added`, `${collectionName} added to MongoDB successfully`);
            
            // Check if the Model is not User before broadcasting to all clients
            if (Model.modelName !== 'User') {
                io.emit(eventName, data); // Emit the new data to all connected clients
            }
        }
    } catch (error) {
        console.error(`Error adding ${collectionName} to MongoDB:`, error);
        // Emit an error message back to the client
        socket.emit(`${collectionName}AddedError`, `Error adding ${collectionName} to MongoDB`);
    }
}


async function doesDocumentExist(Model, filter) {
    try {
        // Find a document that matches the given filter
        const existingDocument = await Model.findOne(filter);

        // Return true if a document was found, false otherwise
        return !!existingDocument;
    } catch (error) {
        console.error('Error checking document existence:', error);
        return false; // Return false in case of an error
    }
}