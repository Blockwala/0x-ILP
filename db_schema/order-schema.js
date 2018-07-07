var mongoose = require('mongoose');
require('mongoose-long')(mongoose);
var Long = mongoose.Schema.Types.Long;

var orderSchema = mongoose.Schema({
	creator_id: mongoose.Schema.Types.ObjectId,
	isMaker: Boolean,  /// Is this required ?
	maker: String,
	taker: String,
	feeRecipient: String,
	makerTokenAddress: String,
	takerTokenAddress: String,
	exchangeContractAddress: String,
	salt: Long,
	makerFee: Long,
	takerFee: Long,
	makerTokenAmount: Long, // Base 18 decimals
    takerTokenAmount: Long, // Base 18 decimals
	expirationUnixTimestampSec: Long,
	ecSignature: {
		v: Number,
		r: String,
		s: String
	}
});