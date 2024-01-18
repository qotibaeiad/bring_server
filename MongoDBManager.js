const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    id: String,
    url: String,
    desc: String,
    price: Number,
    category: String,
    quant: Number,
    shop: String,
    time: String,
    location: String,
    stars: String,
});

const Item = mongoose.model('Item', itemSchema);

class MongoDBManager {
    constructor() {
        this.uri = "mongodb+srv://qotibaeiad11:qCncRQXjKh9UvEYx@bringy.z08amgt.mongodb.net/bringy?retryWrites=true&w=majority";
    }

    async connect() {
        try {
            await mongoose.connect(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });
            console.log('Server has been connected to MongoDB');

            // Set up change stream
            const changeStream = Item.watch();
            changeStream.on('change', (change) => {
                // Log the entire change event for detailed information
                console.log('Change:', change);
            
                // Check the type of operation
                switch (change.operationType) {
                    case 'insert':
                        console.log('Insert operation:', change.fullDocument);
                        // Handle insert operation
                        break;
                    case 'update':
                        console.log('Update operation:', change.documentKey, change.updateDescription);
                        // Handle update operation
                        break;
                    case 'delete':
                        console.log('Delete operation:', change.documentKey);
                        // Handle delete operation
                        break;
                    default:
                        console.log('Unsupported operation type:', change.operationType);
                        break;
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    async getItems() {
        try {
            const items = await Item.find().exec();
            return items;
        } catch (error) {
            console.error('Error fetching items:', error);
            throw error;
        }
    }
}

module.exports = MongoDBManager;
