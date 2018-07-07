var mongoDB = require('mongoose');
var db = require('mongodb');
var Promise = require("bluebird");

var orderSchema = require('../db_schema/order-schema');
var orderModel = mongoDB.model("order", orderSchema);

order = Promise.promisifyAll(orderModel);

var orderDb_operations = {};

orderDb_operations.findOne = (_makerCoinId, _toRetrieve) => {
    return order.findOne({maker_coin_id: _makerCoinId}, _toRetrieve);
}


orderDb_operations.create = (data) => {
    return order.create(data);
}

orderDb_operations.findOneAndUpdate = (_makerCoinId, data) => {
    return order.findOneAndUpdate({ maker_coin_id: _makerCoinId}, {$set: data});
}

module.exports = orderDb_operations;