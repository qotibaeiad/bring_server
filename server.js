const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: String,
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

async function connect() {
    try {
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Server has been connected to MongoDB');

/*
        function setupChangeStream(Model, eventType, eventEmitter, eventName) {
            const changeStream = Model.watch();
            
            changeStream.on(eventType, (change) => {
                //console.log('item url is: ');
            console.log(change.fullDocument);
                eventEmitter.emit(eventName, change.fullDocument);
            });
        
            changeStream.on('error', (error) => {
                console.error('Change stream error:', error);
            });
        }


        function setupDeleteStream(Model, eventType, eventEmitter, eventName) {
            const deleteStream = Model.watch();
        
            deleteStream.on(eventType, (change) => {
                if (change.operationType === 'delete') {
                    // Access the '_id' field, which is equivalent to MongoDB _id
                    const deletedItemId = change.documentKey._id;
                    console.log('_id is :');
                    console.log(deletedItemId);
                    eventEmitter.emit(eventName, { deletedItemId: deletedItemId });
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
        */
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
   // saveToCollection()

    socket.on('streamitem', async (userData) => {
        Item.find().cursor().eachAsync((item) => {
            socket.emit('streamitems', item);
            console.log(`Item emitted: ${item.category}, ${item.desc}`);
        });    });


        // Server side
// Server side
socket.on('phonenumber', (phoneNumberData) => {
    const randomFourDigitNumber = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(`Received phone number of client with id ${clientId}:`, phoneNumberData);
    sendTwilioMessage(phoneNumberData,randomFourDigitNumber);
    // Extract phone number and isoCode from the received JSON data
   // const phoneNumber = phoneNumberData.phoneNumber;
   // const isoCode = phoneNumberData.isoCode;

    // Now you can process phoneNumber and isoCode as needed
    // For example, you can emit a verification code back to the client
  });

  

    socket.on('message', async (userData) => {
        console.log(`The length is ${userData.length}`);
    });



    socket.on('addUser', async (userData) => {
        //await saveToCollection(socket, userData, 'User', User);
    });

    socket.on('addItem', async (itemData) => {
       // await saveToCollection(socket, itemData, 'Item', Item);
    });

    socket.on('ExistUser', async (userData) => {
        //await SaveUser(socket, userData);
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

/*
async function saveToCollection(socket, data, collectionName, Model, eventName) {
    try {
        const filter = { };
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
*/
/*
async function doesDocumentExist(Model, filter) {
    try {
        const existingDocument = await Model.findOne(filter);
        return !!existingDocument;
    } catch (error) {
        console.error('Error checking document existence:', error);
        return false;
    }
}
*/
const accountSid = 'ACd16ecac30c5367a9e3af753a3c63b0a3';
const authToken = '44e7a0f01dc720bdd70880f8382c2d04';
const twilioPhoneNumber = '+14055710130';
const client = require('twilio')(accountSid, authToken);

function sendTwilioMessage(toPhoneNumber, messageBody) {
    client.messages
      .create({
        from: twilioPhoneNumber,
        to: toPhoneNumber,
        body: messageBody.toString(),  // Add the message body parameter
      })
      .then(message => console.log(`Message sent successfully. SID: ${message.sid}`))
      .catch(error => console.error('Error sending message:', error))
  }
  



/////////////////////////////////////////////////////////////

/*
// Function to save data to a specific collection
async function saveToCollection1(Model, data, eventName) {
    try {
        const filter = { };
        const update = { $setOnInsert: data };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };

        const result = await Model.findOneAndUpdate(filter, update, options);

        if (result) {
            // Document already exists, emit an event or handle accordingly
            console.log(`${Model.modelName} with this data already exists`);
        } else {
            // Document inserted or updated successfully
            console.log(`${Model.modelName} added/updated to MongoDB successfully`);
            if (eventName) {
                // Emit an event if an event name is provided
                io.emit(eventName, data);
            }
        }
    } catch (error) {
        console.error(`Error adding/updating ${Model.modelName} to MongoDB:`, error);
    }
}

// Function to check if something exists in a specific collection
async function doesDocumentExist(Model, filter) {
    try {
        const existingDocument = await Model.findOne(filter);
        return !!existingDocument;
    } catch (error) {
        console.error('Error checking document existence:', error);
        return false;
    }
}

// Function to update something in a specific collection
async function updateInCollection(Model, filter, updateData) {
    try {
        const updatedDocument = await Model.findOneAndUpdate(filter, updateData, { new: true });

        if (updatedDocument) {
            // Document updated successfully
            console.log(`${Model.modelName} updated:`, updatedDocument);
            return updatedDocument;
        } else {
            // Document not found for update
            console.log(`Document not found for update in ${Model.modelName}`);
            return null;
        }
    } catch (error) {
        console.error(`Error updating ${Model.modelName}:`, error);
        return null;
    }
}

// Save to User collection
saveToCollection(UserModel, { name: 'John Doe', phoneNumber: '1234567890' }, 'userChange');

// Check if something exists in Item collection
const itemExists = await doesDocumentExist(ItemModel, { url: 'example.com' });
console.log(`Item exists: ${itemExists}`);

// Update something in User collection
const updatedUser = await updateInCollection(UserModel, { name: 'John Doe' }, { phoneNumber: '9876543210' });
console.log(`Updated user:`, updatedUser);

////////////////////////////////////////////////////////////////////////
*/