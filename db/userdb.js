var mongoDB = require('mongoose');
var db = require('mongodb');
var Promise = require("bluebird");

var userSchema = require('../db_schema/user-schema');
var user = mongoDB.model("user", userSchema);

user = Promise.promisifyAll(user);

var userdb_operations = {};

userdb_operations.findOne = (_findByData, _toRetrieve) => {
    return user.findOne(_findByData, _toRetrieve);
}


userdb_operations.create = (data) => {
    return user.create(data);
}

userdb_operations.findOneAndUpdate = (id, data) => {
    return user.findOneAndUpdate({ _id: id}, {$set: data});
}

module.exports = userdb_operations;