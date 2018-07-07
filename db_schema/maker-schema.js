var mongoose = require('mongoose');

var makerSchema = mongoose.Schema({
    user_id: mongoose.Schema.Types.ObjectId,
    name: String,
    description: [String],
    images: [String],
    token_address: String
});

module.exports = makerSchema;