var mongoose = require('mongoose');

var makerCoinSchema = mongoose.Schema({
    maker_id: mongoose.Schema.Types.ObjectId,
    coin_name: String,
    coin_symbol: String,
    coin_decimals: Number,
    total_supply: Number,
    preminted_supply: Number,
    cappedSaleStart: Number,
    publicSaleStartTime: Number,
    publicSaleEndTime: Number
});

module.exports = makerCoinSchema;