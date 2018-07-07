var mongoDB = require('mongoose');
var db = require('mongodb');
var Promise = require("bluebird");

var makercoinSchema = require('../db_schema/maker-coin-schema');
var makerCoinModel = mongoDB.model("maker_coin", makercoinSchema);

makerCoin = Promise.promisifyAll(makerCoinModel);

var makerCoinDb_operations = {};


// eg. of _findByData=  {coin_symbol: "SCC"}
makerCoinDb_operations.findOne = (_findByData, _toRetrieve) => {
    return makerCoin.findOne(_findByData, _toRetrieve);
}

// makerCoinDb_operations.findOneWithCoinSymbol = (_coinSymbol, _toRetrieve) => {
//     return makerCoin.findOne({coin_symbol: _coinSymbol}, )
// }


makerCoinDb_operations.create = (data) => {
    return makerCoin.create(data);
}

makerCoinDb_operations.findOneAndUpdate = (_makerId, data) => {
    return makerCoin.findOneAndUpdate({ maker_id: _makerId}, {$set: data});
}

module.exports = makerCoinDb_operations;