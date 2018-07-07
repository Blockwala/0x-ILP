var helper = {};

var Web3 = require('web3');

var fs = require("fs");
var util = require('ethereumjs-util')
var config = require('config');

var helper = {};

/*
 * amountToSend : should be in Wei
 */
helper.makeTransactionObject = function(to, encodedABI,
    gasPrice, gas, amountToSend) {
    var tx = {
        "to": config.get('bingo_interface_address'),
        "gas": gasPrice,
        "gasPrice": gas,
        "data": encodedABI
    }
    if (amountToSend) tx["value"] = amountToSend;
    return tx;
}

helper.verifyPrivatePubKeyIsFromSameSource = function(privateKey) {
    var privateKeyBytes = new Buffer(privateKey.replace("0x", ""), "hex");
    var derivedPubKey = util.privateToPublic(privateKeyBytes);
    console.log("derivedPubKey ")
    console.log(derivedPubKey);
    var hexPubKey = util.bufferToHex(derivedPubKey);
    console.log("hexPubKey " + hexPubKey);
    var addressBuffer = util.pubToAddress(hexPubKey);
    var address = util.bufferToHex(addressBuffer);
    console.log("address " + address);
    return address;
}

module.exports = helper;