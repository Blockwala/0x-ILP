var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    email: String,
    hashed_pwd: String,
    wallet: String,
    exchange_allowed: Boolean
});

module.exports = userSchema;