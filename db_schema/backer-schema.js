var mongoose = require('mongoose');

var backerSchema = mongoose.Schema({
    user_id: mongoose.Schema.Types.ObjectId,
    name: String,
    kyc_details: [String]
})

module.exports = backerSchema;