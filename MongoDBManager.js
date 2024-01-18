const mongoose = require('mongoose');

class MongoDBManager {
    constructor() {
        this.uri = "mongodb+srv://qotibaeiad11:qCncRQXjKh9UvEYx@bringy.z08amgt.mongodb.net/bringy?retryWrites=true&w=majority";
    }

    async connect() {
        try {
            await mongoose.connect(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });
            console.log('Server has been connected to MongoDB');
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports = MongoDBManager;
