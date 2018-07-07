var mongoDB = require('mongoose');
var db = require('mongodb');
var Promise = require("bluebird");

var backerSchema = require('../db_schema/backer-schema');
var backerModel = mongoDB.model("backer", backerSchema);

backer = Promise.promisifyAll(backerModel);

var backerDb_operations = {};

backerDb_operations.findOne = (_findByData, _toRetrieve) => {
    return backer.findOne(_findByData, _toRetrieve);
}


backerDb_operations.create = (data) => {
    return backer.create(data);
}

backerDb_operations.findOneAndUpdate = (_userId, data) => {
    return backer.findOneAndUpdate({ user_id: _userId}, {$set: data});
}

module.exports = backerDb_operations;