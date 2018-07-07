var ZeroEx = require("0x.js").ZeroEx;
var DecodedLogEvent = require("0x.js").DecodedLogEvent;

var BigNumber = require('@0xproject/utils').BigNumber;

var Web3 = require('web3');

var helper = require('./web3-helper');

var TESTRPC_NETWORK_ID = 50;

// Provider pointing to local TestRPC on default port 8545
var provider = new Web3.providers.HttpProvider('http://localhost:8545');

var web3Socket = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));

// Instantiate 0x.js instance
var configs = {
    networkId: TESTRPC_NETWORK_ID,
};
var zeroEx = new ZeroEx(provider, configs);

var DECIMALS = 18;

zeroExHelper = {};

zeroExHelper.proxyAllowance(_ownerAddress, 
							_tokenAddress, 
							_allowanceAmount, 
							successEvent, 
							failureEvent) => {
	zeroEx.token.setProxyAllowanceAsync(_tokenAddress, _ownerAddress, _allowanceAmount)
		.then(txHash => {
			helper.makeSendSignedTx(txHash, successEvent, failureEvent);
		})
} 

zeroExHelper.createSignedOrder = (_creatorAddress, 
                                  _CTAddress, 
                                  _ATAddress, 
                                  _CTokenAmount,
                                  _ATokenAmount,
                                  _expirationTimeStamp,
                                  _takerAddress) => {

    var EXCHANGE_ADDRESS = zeroEx.exchange.getContractAddress();

	var order;
	var signedOrder;

	// to give 0x protocol Proxy smart contract access to funds, 
	// we need to set allowances

	// zeroEx.token.setUnlimitedProxyAllowanceAsync(_CTAddress, _creatorAddress)
	// .then((setMakerAllowTxHash) => {
	// 	return zeroEx.awaitTransactionMinedAsync(setMakerAllowTxHash);
	// })
	// .then(() => {
	// 	zeroEx.token.setUnlimitedProxyAllowanceAsync(SCC_ADDRESS, takerAddress);
	// })
	// .then((setTakerAllowTxHash) => {
	// 	zeroEx.awaitTransactionMinedAsync(setTakerAllowTxHash);
	// 	console.log("Taker ALlowance Mined...");
	// })
	.then(() => {
        console.log("Creator's Token's allowance mined...");

        if (!_takerAddress) {
            _takerAddress = ZeroEx.NULL_ADDRESS;
        }

		// Generate order
		order = {
			maker: _creatorAddress,
			taker: _takerAddress,
			feeRecipient: ZeroEx.NULL_ADDRESS,
			makerTokenAddress: _CTAddress,
			takerTokenAddress: _ATAddress,
			exchangeContractAddress: EXCHANGE_ADDRESS,
			salt: ZeroEx.generatePseudoRandomSalt(),
			makerFee: new BigNumber(0),
			takerFee: new BigNumber(0),
			makerTokenAmount: ZeroEx.toBaseUnitAmount(new BigNumber(_CTokenAmount), DECIMALS), // Base 18 decimals
			takerTokenAmount: ZeroEx.toBaseUnitAmount(new BigNumber(_ATokenAmount), DECIMALS), // Base 18 decimals
			expirationUnixTimestampSec: new BigNumber(Date.now() + _expirationTimeStamp), // Valid for up to an hour
		};

		// console.log(JSON.stringify(order));
		return order;
	})
	.then((order) => {
		// Create orderHash
		const orderHash = ZeroEx.getOrderHashHex(order);
		console.log("orderhash ", orderHash);

		// Signing orderHash -> ecSignature
		const shouldAddPersonalMessagePrefix = false;
		return zeroEx.signOrderHashAsync(orderHash, _creatorAddress, shouldAddPersonalMessagePrefix);
	})
	.then(ecSignature => {
		console.log("ECDSA signature ", JSON.stringify(ecSignature));

		// Appending signature to order
		signedOrder = {
			...order,
			ecSignature,
		};

		console.log("Order signed by maker: ", JSON.stringify(signedOrder));

		// Verify that order is fillable // Throwing error INSUFFICIENT_MAKER_BALANCE
		return zeroEx.exchange.validateOrderFillableOrThrowAsync(signedOrder);
	})
	.then(() => {
		return signedOrder;
	});

}