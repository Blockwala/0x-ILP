var backerFuncs = {}

var aync = require('async');

var helper = require('../helper/web3-helper.js');
var localHelper = require('../helper/local-helper.js');
var config = require('config');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var fetch = require("node-fetch");
// var deployer = require('../helper/deployer');

var ZeroEx = require('0x.js').ZeroEx;
var ZeroExConfig = require('0x.js').ZeroExConfig;
var FeesRequest = require('@0xproject/connect').FeesRequest;
var FeesResponse = require('@0xproject/connect').FeesResponse;
var HttpClient = require('@0xproject/connect').HttpClient;
var Order = require('@0xproject/connect').Order;
var OrderbookRequest = require('@0xproject/connect').OrderbookRequest;
var OrderbookResponse = require('@0xproject/connect').OrderbookResponse;
var SignedOrder = require('@0xproject/connect').SignedOrder;
var BigNumber = require('@0xproject/utils').BigNumber;


var Backer = require('../db/backerdb');
var Maker = require('../db/makerdb');
var MakerCoinDB = require('../db/maker-coindb');


// todo: import DM here, if required


//-----------------------POST----------------------------------->

backerFuncs.createBacker = (req, res, next) => {
	res.setHeader('Content-Type', 'application/json');

    dbEntry = {
        user_id: req.body.user_id,
        name: req.body.name,
        kyc_details: req.body.kyc_data
    }

    Backer.create(dbEntry)
        .then((dbResponse) => {
            res.status(200).send(dbResponse);
        }).catch((err) => {
            res.send(500).send(err);
        });
}

backerFuncs.processOrder = async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    var userId = req.body.user_id;

    // Provider pointing to local TestRPC on default port 8545
    const provider = new Web3.providers.HttpProvider('http://localhost:8545');

    // Instantiate 0x.js instance
    const config = {
        networkId: 50, // testrpc
    };
    const zeroEx = new ZeroEx(provider, zeroExConfig);

    // Instantiate relayer client pointing to a local server on port 3000
    const relayerApiUrl = 'http://localhost:3000/v0';
    const relayerClient = new HttpClient(relayerApiUrl);

    // Get exchange contract address
    const EXCHANGE_ADDRESS = req.body.exchange_address; // await zeroEx.exchange.getContractAddress();

    // Get token information
    // const sccTokenInfo = req.body.scc_address;
    // const zrxTokenInfo = req.body.maker_token_address;

    // Check if either getTokenBySymbolIfExistsAsync query resulted in undefined
    // if (sccTokenInfo === undefined || zrxTokenInfo === undefined) {
    //     throw new Error('could not find token info');
    // }

    // Get token contract addresses
    const SCC_ADDRESS = req.body.scc_address;
    const MAKER_TOKEN_ADDRESS = req.body.maker_token_address;

    sccDecimals = req.body.scc_decimals;

    // Get all available addresses
    const addresses = await zeroEx.getAvailableAddressesAsync();

    // Get the first address, this address is preloaded with a Maker's Token's balance from the snapshot
    const makerAddress = req.body.maker_address;

    // Assign other addresses as SCC owners
    const sccOwnerAddresses = req.body.backers_addresses;

    // Set SCC and Maker's Token unlimited allowances for all addresses
    const setMakerTokenAllowanceTxHashes = await Promise.all(addresses.map(address => {
        return zeroEx.token.setUnlimitedProxyAllowanceAsync(MAKER_TOKEN_ADDRESS, address);
    }));
    const setSccAllowanceTxHashes = await Promise.all(addresses.map(address => {
        return zeroEx.token.setUnlimitedProxyAllowanceAsync(SCC_ADDRESS, address);
    }));
    await Promise.all(setMakerTokenAllowanceTxHashes.concat(setSccAllowanceTxHashes).map(tx => {
        return zeroEx.awaitTransactionMinedAsync(tx);
    }));

    // Deposit ETH and generate SCC tokens for each address in sccOwnerAddresses
    const ethToConvert = ZeroEx.toBaseUnitAmount(new BigNumber(5), sccDecimals);
    const depositTxHashes = await Promise.all(sccOwnerAddresses.map(address => {
        return zeroEx.etherToken.depositAsync(SCC_ADDRESS, ethToConvert, address);
    }));
    await Promise.all(depositTxHashes.map(tx => {
        return zeroEx.awaitTransactionMinedAsync(tx);
    }));

    // Generate and submit orders with increasing Maker Token/SCC exchange rate
    await Promise.all(sccOwnerAddresses.map(async (address, index) => {
        // Programmatically determine the exchange rate based on the index of address in sccOwnerAddresses
        const exchangeRate = (index + 1) * 10; // makerToken/SCC
        const makerTokenAmount = ZeroEx.toBaseUnitAmount(new BigNumber(5), sccDecimals);
        const takerTokenAmount = makerTokenAmount.mul(exchangeRate);

        // Generate fees request for the order
        const ONE_HOUR_IN_MS = 3600000;
        const feesRequest = {
            exchangeContractAddress: EXCHANGE_ADDRESS,
            maker: address,
            taker: ZeroEx.NULL_ADDRESS,
            makerTokenAddress: MAKER_TOKEN_ADDRESS,
            takerTokenAddress: SCC_ADDRESS,
            makerTokenAmount,
            takerTokenAmount,
            expirationUnixTimestampSec: new BigNumber(Date.now() + ONE_HOUR_IN_MS),
            salt: ZeroEx.generatePseudoRandomSalt(),
        };

        // Send fees request to relayer and receive a FeesResponse instance
        const feesResponse = await relayerClient.getFeesAsync(feesRequest);

        // Combine the fees request and response to from a complete order
        const order = {
            ...feesRequest,
            ...feesResponse,
        };

        // Create orderHash
        const orderHash = ZeroEx.getOrderHashHex(order);

        // Sign orderHash and produce a ecSignature
        const ecSignature = await zeroEx.signOrderHashAsync(orderHash, address, false);

        // Append signature to order
        const signedOrder = {
            ...order,
            ecSignature,
        };

        // Submit order to relayer
        await relayerClient.submitOrderAsync(signedOrder);
    }));

    // Generate orderbook request for Maker's Tokens/SCC pair
    const orderbookRequest = {
        baseTokenAddress: MAKER_TOKEN_ADDRESS,
        quoteTokenAddress: SCC_ADDRESS,
    };

    // Send orderbook request to relayer and receive an OrderbookResponse instance
    const orderbookResponse = await relayerClient.getOrderbookAsync(orderbookRequest);

    // Because we are looking to exchange our Maker's Tokens for SCC, we get the bids side of the order book
    // Sort them with the best rate first
    const sortedBids = orderbookResponse.bids.sort((orderA, orderB) => {
        const orderRateA = (new BigNumber(orderA.makerTokenAmount)).div(new BigNumber(orderA.takerTokenAmount));
        const orderRateB = (new BigNumber(orderB.makerTokenAmount)).div(new BigNumber(orderB.takerTokenAmount));
        return orderRateB.comparedTo(orderRateA);
    });

    // Calculate and print out the SCC/ZRX exchange rates
    const rates = sortedBids.map(order => {
        const rate = (new BigNumber(order.makerTokenAmount)).div(new BigNumber(order.takerTokenAmount));
        return (rate.toString() + " SCC/Maker's Token");
    });
    console.log(rates);

    // Get balances before the fill
    // const zrxBalanceBeforeFill = await zeroEx.token.getBalanceAsync(ZRX_ADDRESS, zrxOwnerAddress);
    // const sccBalanceBeforeFill = await zeroEx.token.getBalanceAsync(SCC_ADDRESS, zrxOwnerAddress);
    // console.log('ZRX Before: ' + ZeroEx.toUnitAmount(zrxBalanceBeforeFill, zrxTokenInfo.decimals).toString());
    // console.log('SCC Before: ' + ZeroEx.toUnitAmount(sccBalanceBeforeFill, sccTokenInfo.decimals).toString());

    // Completely fill the best bid
    const bidToFill = sortedBids[0];
    const fillTxHash = await zeroEx.exchange.fillOrderAsync(bidToFill, bidToFill.takerTokenAmount, true, makerAddress);
    await zeroEx.awaitTransactionMinedAsync(fillTxHash);

    res.status(200).send("Order from Relayer successfully filled");

    // Get balances after the fill
    // const zrxBalanceAfterFill = await zeroEx.token.getBalanceAsync(ZRX_ADDRESS, zrxOwnerAddress);
    // const sccBalanceAfterFill = await zeroEx.token.getBalanceAsync(SCC_ADDRESS, zrxOwnerAddress);
    // console.log('ZRX After: ' + ZeroEx.toUnitAmount(zrxBalanceAfterFill, zrxTokenInfo.decimals).toString());
    // console.log('SCC After: ' + ZeroEx.toUnitAmount(sccBalanceAfterFill, sccTokenInfo.decimals).toString());
}


//-----------------------GET------------------------------------>

backerFuncs.getMakerDetails = (req, res, next) => {
    var makerId = req.params.maker_id;

    Maker.findOne(maker_id, {user_id: true,
                             name: true,
                             description: true,
                             images: true})
        .then(resObject => {
            res.status(200).send(resObject);
        }).catch(err => {
            res.send(500).send(err);
        });
}



module.exports = backerFuncs;