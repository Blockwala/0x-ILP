orderDB_helper = {};

var OrderDB = require('../db/orderdb.js');
var MakerCoin = require('../db/maker-coindb');
var Maker = require('../db/makerdb');

orderDB_helper.create = (dbEntry, user_id) => {
	return Maker.findOne(user_id, {_id: true})
		.then((makerId) => {
			return MakerCoin.findOne(makerId, {_id: true});
		})
		.then((MakerCoinId) => {
			dbEntry['maker_coin_id'] = MakerCoinId;
			return OrderDB.create(dbEntry);
		})
		.then((dbResponse) => {
			return dbResponse;
		})
		.catch((err) => {
			console.log(err);
			throw new Error(err);
		});
}

orderDB_helper.getAllOrders = (_symbol) => {

	MakerCoin.findOne({coin_symbol: coinSymbol}, {maker_id: true})
	.then(makerId => {
		
	})
}

module.exports = orderDB_helper;