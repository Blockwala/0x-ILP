var makerFuncs = {};

var aync = require('async');

var Web3 = require('web3');
var helper = require('../helper/web3-helper.js');
var localHelper = require('../helper/local-helper.js');
var config = require('../config/development.js');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var fetch = require("node-fetch");
var deployer = require('../helper/deployer');

// import { DecodedLogEvent, ZeroEx } from '0x.js';
var DecodedLogEvent = require('0x.js').DecodedLogEvent;
var ZeroEx = require('0x.js').ZeroEx;
// import { BigNumber } from '@0xproject/utils';
// import * as Web3 from 'web3';
var BigNumber = require('@0xproject/utils').BigNumber;

const TESTRPC_NETWORK_ID = 50;

// @todo : take these netowrk configurations and SCC Address from the config file

// Provider pointing to local TestRPC on default port 8545
const provider = new Web3.providers.HttpProvider('http://localhost:8545');

var web3Socket = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));

var SCC_ADDRESS = "0xb48e1b16829c7f5bd62b76cb878a6bb1c4625d7a";

// Instantiate 0x.js instance
const configs = {
    networkId: TESTRPC_NETWORK_ID,
};

const zeroEx = new ZeroEx(provider, configs);

// Number of decimals to use (for ETH and ZRX)
const DECIMALS = 18;



var Maker = require('../db/makerdb');
var MakerCoin = require('../db/maker-coindb');
var OrderDB = require('../db/orderdb');

var makerDM = require('../DM/maker-dm');
var makerCoinDM = require('../DM/maker-coindm');
var orderDM = require('../DM/order-dm');


var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config/development');

//----> todo: change these possibly
var errorMessage = "Insufficient funds in account or invalid account";
var errorMessagemakerFuncs = "Insufficient funds in account or invalid sale";


//-----------------------POST----------------------------------->

/**
 * Updates details of the project in database before deployment of the contracts
 * @param {req} req can contain any of the parameters given in properties array below to be updated in DB
 * @param {res} res if successful updation, sent res has the newly updated account details..
 * 
 */
makerFuncs.setProjectEntries = (req,res,next) => {
	res.setHeader('Content-Type', 'application/json');
	var Id = req.body.user_id; 

	// The properties to be searched for in req message and in database 
	// for simplicity the name of property in the req msg and name of field in DB Schema has been kept the same
	properties = ['name',
				  'description',
				  'images'];
                  
    var db_entry = {
		user_id: Id
	};

	// to: update the database with any of the properties given in req message
	properties.forEach(element => {
		if (req.body[element]) {
			db_entry[element] = req.body[element];
		}		
	});


	// call function to execute db and if it happens successfully,
	// send in res the updated db data
	// or if it fails, send in res - error data
	makerDM.create(db_entry)
		.then((dbResponse) => {
			res.status(200).send(dbResponse);
		})
		.catch((err) => {
			res.status(500).send(err);
		});

							
}

/**
 * Updates details of the project in database before deployment of the contracts
 * @param {req} req can contain any of the parameters given in properties array below to be updated in DB
 * @param {res} res if successful updation, sent res has the newly updated account details..
 * 
 */
makerFuncs.setCoinEntries = (req,res,next) => {
	res.setHeader('Content-Type', 'application/json');
	var Id = req.body.user_id; 

	// The properties to be searched for in req message and in database 
	// for simplicity the name of property in the req msg and name of field in DB Schema has been kept the same
	properties = ['coin_name',
				  'coin_symbol',
				  'coin_decimals',
				  'total_supply',
                  'preminted_supply']
                  
    var db_entry = {
		
	};

	// to: update the database with any of the properties given in req message
	properties.forEach(element => {
		if (req.body[element]) {
			db_entry[element] = req.body[element];
		}		
	});


	// call function to execute db and if it happens successfully,
	// send in res the updated db data
	// or if it fails, send in res - error data
	makerCoinDM.create(db_entry, Id)
		.then((dbResponse) => {
			res.status(200).send(dbResponse);
		})
		.catch((err) => {
			res.status(500).send(err);
		});

							
}

/**
 * Deploying the contracts of the user on ethereum blockchain
 * @param {req} req contains details of contract deployment
 * @param {res} res contains contract deployment mesage
 */
makerFuncs.deployMigrations = (req,res, next) => {

    var name = req.body.coin_name;
    var symbol = req.body.coin_symbol;
	var decimals = req.body.coin_decimals;
	
	args = [name, symbol, decimals];
	var dbEntry = {};

	path = config['contract'];
	deployer.deployContract(path, args, "TestCoin.sol")
		.then((contractAddress) => {
			dbEntry['token_address'] = contractAddress;
			Maker.findOneAndUpdate(req.body.user_id, dbEntry );
			res.status(200).send(dbEntry);
		}).catch(err => {
			console.log(err);
			res.status(500).send({msg: "Contract could not be deployed"});
		})

}



//-----------------------GET------------------------------------>

makerFuncs.getMakerDetails = (req, res, next) => {
     var Id = req.id;
	 
	 
    
     
}

makerFuncs.getContractAddress = (req, res) => {

}

makerFuncs.getContractDetails = (req, res) => {

}
 
module.exports = makerFuncs;