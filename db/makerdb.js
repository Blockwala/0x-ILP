var mongoDB = require('mongoose');
var db = require('mongodb');
var Promise = require("bluebird");

var makerSchema = require('../db_schema/maker-schema');
var makerModel = mongoDB.model("maker", makerSchema);

maker = Promise.promisifyAll(makerModel);

var makerDb_operations = {};

makerDb_operations.findOne = (_findByData, _toRetrieve) => {
    return maker.findOne(_findByData, _toRetrieve);
}


makerDb_operations.create = (data) => {
    return maker.create(data);
}

makerDb_operations.findOneAndUpdate = (_userId, data) => {
    return maker.findOneAndUpdate({ user_id: _userId}, {$set: data});
}

module.exports = makerDb_operations;