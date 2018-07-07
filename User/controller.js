var tokenSale = {};

var aync = require('async');

var helper = require('../helper/web3-helper.js');
var localHelper = require('../helper/local-helper.js');
var zeroExHelper = require('../helper/0x-helper.js');
var config = require('config');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var fetch = require("node-fetch");
var ObjectID = require('mongodb').ObjectID;

var User = require('../db/userdb');
var UserDM = require('../DM/user-dm');
var MakerDB = require('../db/makerdb');
var MakerCoinDM = require('../DM/maker-coindm');
var BackerDB = require('../db/backerdb');
var OrderDB = require('../db/orderdb');
var OrderDM = require('../DM/order-dm');

var SCC_ADDRESS = config.get('scc_address');

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config/development');

//----> todo: change these possibly
var errorMessage = "Insufficient funds in account or invalid account";
var errorMessageTokenSale = "Insufficient funds in account or invalid sale";



//-----------------------POST----------------------------------->

/**
 * Registers a user in the database and sends him/her an auth token
 * @param {req} req contains email, user id, password, for req body format see readme
 * @param {res} res status 200 = successful operation, authtoken sent in response's body
 */
tokenSale.registerUser = (req,res) => {
    res.setHeader('Content-Type', 'application/json');
	var Email = req.body.email;
	var id = new ObjectID();
	var pwd = req.body.password;
	
	hashedPassword = bcrypt.hashSync(pwd, 8);

	db_entry = {
		email: Email,
		_id: id,
		hashed_pwd: hashedPassword,
		exchange_allowed: false
	};

	User.create(db_entry)
		.then(() => {
			var token = jwt.sign({ id: id.toString() }, config.secret, {
				expiresIn: 86400 // expires in 24 hours
			});

			res.status(200).send({ auth: true, token: token, user_id: id.toString() });	
		})
		.catch((error) => {
			console.log(error);
			res.status(500).send("There was a problem registering the user.");
		});

    
}

/**
 * Sends the auth token to the user if :
 * 1. id exists 
 * 2. password is correct
 * @param {req} req must contain user_id and password 
 * @param {res} res send the auth token
 */
tokenSale.login = (req,res) => {

	var dateNow = new Date();
	if(req.headers['x-access-token']) {	
		var decoded	= jwt.verify(req.headers['x-access-token'], config.secret)
		if (decoded.exp > dateNow.getTime()) {
			return res.send({auth: true, token: token});
		}
	}

	Id = req.body.user_id;
	User.findOne(email, {hashed_pwd: true})
		.then((hashed_pass) => {
			hashedPassword = bcrypt.hashSync(req.body.password, 8);
		
			var passwordIsValid = (hashed_pass == hashedPassword); 
			if (!passwordIsValid) return res.status(401).send({ auth: false, token: null, message: "Wrong Password!!" });
		
			var token = jwt.sign({ id: Id }, config.secret, {
			  expiresIn: 86400 // expires in 24 hours
			});
		
			res.status(200).send({ auth: true, token: token });	
		}).catch(err => {
			console.log(err);
			res.status(404).send({ auth: false, token: null, message: "Account not found"});
		})
}

/**
 * Authenticates the token, to be used before executing any function that requires user to be logged in 
 * @param {req} req req header contains the auth token 
 * @param {res} res res sends error if no token provided or token doesn't get authenticated
 * @param {next} next move to the next callback, if all goes well
 */
tokenSale.verifyToken = (req, res, next) => {
	res.setHeader('Content-Type', 'application/json');
	var token = req.headers['x-access-token'];
	if (!token) {
		return res.status(403).send({ auth: false, message: 'No token provided.' });
	}

	// console.log(token);
	// console.log(config.secret);
	jwt.verify(token, config.secret, function(err, decoded) {
	  	if (err) {
	  		return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
		}

		// if everything good, save to request for use in other routes
		req.body['user_id'] = decoded.id;
		// console.log(req.body);
		next();
	});
  }



/**
 * Logs out user by sending an invalid auth token
 * @param {req} req nothing requires
 * @param {res} res an invalid token
 */
tokenSale.logOut = (req, res) => {
	res.status(200).send({ auth: false, token: null });
}


/**
 * Allows 0x exchanges from this account
 * @param {req} req contains user id, amount for for which proxyy allowance is to be given, and token symbol in case of maker
 * @param {res} res message to convey that 0x exchanges have been allowed for this account
 */
tokenSale.allowZeroEx = (req, res) => {
	var userId = req.body.user_id;
	var allowanceAmount = req.body.allowance_amount;

	var successEvent = (receipt) => {
        console.log("Success");
        console.log(receipt);
        console.log(JSON.stringify(receipt));
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify(receipt));
    }

    var failureEvent = (error) => {
        console.log("error");
        console.log(error);
        res.setHeader('Content-Type', 'application/json');
        res.status(500).send(JSON.stringify({ message: errorMessage }));
	}
	
	UserDM.isMaker(user_id)
	.then(isMkr => {
		if (isMkr) {
			tokenSymbol = req.body.token_symbol;
			tokenAddress = MakerCoinDM.getTokenData(tokenSymbol);
		} else {
			tokenAddress = SCC_ADDRESS:
		}
		return tokenAddress;
	})
	.then((tokenAddress) => {
		return User.findOne({_id: userId}, {wallet:true}), tokenAddress;
	})
	.then((ownerAddress, tokenAddress) => {
		zeroExHelper.proxyAllowance(ownerAddress,
									tokenAddress, 
									allowanceAmount,
									successEvent,
									failureEvent);
	})	

	// User.findOneAndUpdate(_id, {exchange_allowed: true})
	// 	.then(() => {
	// 		res.status(200).send({"msg": "0x token exchanges allowed for this account"});
	// 	})
	// 	.catch(err => {
	// 		console.log(err);
	// 		res.status(500).send(err);
	// 	});
}


/**
 * Create an order
 * @param {req} req 
 * @param {res} res
 */
tokenSale.createOrder = (req, res) => {

	var userId = req.body.user_id;

	var tokenToExchangeWithSCC = req.body.token_to_exchange_with_scc_symbol;

	var CTokenAmount = req.body.creator_token_amount;
	var ATokenAmount = req.body.another_token_amount;

	var expirationTimeStamp = req.body.expiry_time;

	var AT_ADDRESS;
	var CT_ADDRESS;

	/**
	 * @todo take private keys and use local helper to convert to public for ordercreator
	 */

	 // user address 1st step: b/m? pub add? (MAKER ADDRES)
	 // .then(){ step2 : if(isMaker) MakerTOken = FE, TakerTOken = SCC
	 //  else MakerTOken = SCC,   TakerToken = FE
	 //.    exchange rate
	 // time 
	 // zeroExHelper.createSignedOrder

	UserDM.isMaker(userId)
	.then((isMkr) => {
		return MakerCoinDM.getTokenData(tokenToExchangeWithSCC), isMkr;
	})
	.then((tokenAddress, isMkr) => {
		if(isMkr) {
			AT_ADDRESS = SCC_ADDRESS;
			CT_ADDRESS = tokenAddress;
		} else {
			CT_ADDRESS = SCC_ADDRESS;
			AT_ADDRESS = tokenAddress;
		}
		return User.findOne({_id: userId}, {wallet:true});
	})
	.then((makerAddress) => {
		var signedOrder = zeroExHelper.createSignedOrder(
			makerAddress,
			CT_ADDRESS,
			AT_ADDRESS,
			CTokenAmount,
			ATokenAmount,
			expirationTimeStamp,
			takerAddress
		);

		return signedOrder;
	})
	.then(signedOrder => {
		return BackerDB.findOne({user_id: userId}, {_id: true}), signedOrder;
	}).then((backerId, signedOrder) => {
		signedOrder['isMaker'] = false;
		signedOrder['creator_id'] = userId;
		return OrderDB.create(signedOrder);
	}).then(dbResponse => {
		res.status(200).send(dbResponse);
	}).catch(err => {
		console.log(err);
		res.status(500).send(err);
	});
}



//-----------------------GET------------------------------------>

tokenSale.getContractAddress = (req, res) => {

}

tokenSale.getContractDetails = (req, res) => {

}

backerFuncs.getOrderDataByTicker = (req,res) => {
    var coinSymbol = req.params.ticker;

	MakerCoinDB.findOne({coin_symbol: coinSymbol}, {maker_id: true})
	.then(makerId => {
		
	})
}


 
module.exports = tokenSale;