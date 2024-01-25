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



const Itempopular = mongoose.model('Item', itemSchema,'popular');
const Itemtop = mongoose.model('Item',itemSchema,'top');

class MongoDBManager {
    constructor() {
        this.uri = "mongodb+srv://qotibaeiad11:qCncRQXjKh9UvEYx@bringy.z08amgt.mongodb.net/bringy?retryWrites=true&w=majority";
    }

    async connect() {
        try {
            await mongoose.connect(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });
            console.log('Server has been connected to MongoDB');

            // Set up change stream
            const changeStreampopularitem = Itempopular.watch();
            changeStreampopularitem.on('change', (change) => {
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

//////////////////////
        try {

            // Set up change stream
            const changeStreamtopitem = Itemtop.watch();
            changeStreamtopitem.on('change', (change) => {
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
            console.error(error)
        }

    }

    async getItemspopular() {
        try {
            const items = await Itempopular.find().exec();
            return items;
        } catch (error) {
            console.error('Error fetching items:', error);
            throw error;
        }
    }

    async getItemstop() {
        try {
            const items = await Itemtop.find().exec();
            return items;
        } catch (error) {
            console.error('Error fetching items:', error);
            throw error;
        }
    }
}

module.exports = MongoDBManager;
