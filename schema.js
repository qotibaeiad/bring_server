const { Schema } = require("mongoose");

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

module.exports = schema;