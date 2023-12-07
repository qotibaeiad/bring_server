const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    phoneNumber: String,
});

const itemSchema = new mongoose.Schema({
    url: String,
    desc: String,
    price: String,
    category: String,
    quant: String,
    shop: String,
});

const User = mongoose.model('User', userSchema);
const Item = mongoose.model('Item', itemSchema);

const uri = "mongodb+srv://qotibaeiad11:qCncRQXjKh9UvEYx@bringy.z08amgt.mongodb.net/bringy?retryWrites=true&w=majority";






// Add this line inside the 'connect' function, after 'setupChangeStream'

async function connect() {
    try {
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Server has been connected to MongoDB');


        function setupChangeStream(Model, eventType, eventEmitter, eventName) {
            const changeStream = Model.watch();
            
            changeStream.on(eventType, (change) => {
                //console.log('item url is: ');
            //console.log(change.fullDocument);
                eventEmitter.emit(eventName, change.fullDocument);
            });
        
            changeStream.on('error', (error) => {
                console.error('Change stream error:', error);
            });
        }


        function setupDeleteStream(Model, eventType, eventEmitter, eventName) {
            const deleteStream = Model.watch({ fullDocument: 'updateLookup' });
        
            deleteStream.on(eventType, (change) => {
                if (change.operationType === 'delete') {
                    // Access the 'url' field, which is equivalent to MongoDB _id
                    const deletedItemId = change.documentKey.url;
                    console.log('url is :');
                    console.log(deletedItemId);
                    eventEmitter.emit(eventName, { url: deletedItemId });
                } else {
                    const deletedItemUrl = change.fullDocument.url;
                    eventEmitter.emit(eventName, { url: deletedItemUrl });
                }
            });
        
            deleteStream.on('error', (error) => {
                console.error('Delete stream error:', error);
            });
        }
        
        
        
        // Add this line inside the 'connect' function, after 'setupChangeStream'
        setupChangeStream(Item, 'change', io, 'streamitems');
        setupChangeStream(User, 'change', io, 'userChange');
        setupDeleteStream(Item, 'change', io, 'deleteitem');
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
    const clientId = generateUniqueId();
    console.log(`Client connected with ID ${clientId}`);

    Item.find().cursor().eachAsync((item) => {
        socket.emit('streamitems', item);
        console.log(`Item emitted: ${item.category}, ${item.desc}`);
    });


    socket.on('message', async (userData) => {
        console.log(`The length is ${userData.length}`);
    });



    socket.on('addUser', async (userData) => {
        await saveToCollection(socket, userData, 'User', User);
    });

    socket.on('addItem', async (itemData) => {
        await saveToCollection(socket, itemData, 'Item', Item);
    });

    socket.on('ExistUser', async (userData) => {
        await SaveUser(socket, userData);
    });

    socket.on('disconnect', () => {
        console.log(`Client with ID ${clientId} disconnected`);
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

        const result = await Model.findOneAndUpdate(filter, update, options);

        if (result) {
            socket.emit(`${collectionName}AddedError`, `${collectionName} with this data already exists`);
        } else {
            socket.emit(`${collectionName}Added`, `${collectionName} added to MongoDB successfully`);
            
            if (Model.modelName !== 'User') {
                io.emit(eventName, data);
            }
        }
    } catch (error) {
        console.error(`Error adding ${collectionName} to MongoDB:`, error);
        socket.emit(`${collectionName}AddedError`, `Error adding ${collectionName} to MongoDB`);
    }
}

async function doesDocumentExist(Model, filter) {
    try {
        const existingDocument = await Model.findOne(filter);
        return !!existingDocument;
    } catch (error) {
        console.error('Error checking document existence:', error);
        return false;
    }
}
