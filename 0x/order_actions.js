"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
var _0x_js_1 = require("0x.js");
var utils_1 = require("@0xproject/utils");
var Web3 = require("web3");
var TESTRPC_NETWORK_ID = 50;
// Provider pointing to local TestRPC on default port 8545
var provider = new Web3.providers.HttpProvider('http://localhost:8545');
// Instantiate 0x.js instance
var configs = {
    networkId: TESTRPC_NETWORK_ID
};
var zeroEx = new _0x_js_1.ZeroEx(provider, configs);
// Number of decimals to use (for ETH and ZRX)
var DECIMALS = 18;
var mainAsync = function () { return __awaiter(_this, void 0, void 0, function () {
    var WETH_ADDRESS, ZRX_ADDRESS, EXCHANGE_ADDRESS, accounts, makerAddress, takerAddress, setMakerAllowTxHash, setTakerAllowTxHash, ethAmount, ethToConvert, convertEthTxHash, order, orderHash, shouldAddPersonalMessagePrefix, ecSignature, signedOrder, shouldThrowOnInsufficientBalanceOrAllowance, fillTakerTokenAmount, txHash, txReceipt;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                WETH_ADDRESS = zeroEx.etherToken.getContractAddressIfExists();
                ZRX_ADDRESS = zeroEx.exchange.getZRXTokenAddress();
                EXCHANGE_ADDRESS = zeroEx.exchange.getContractAddress();
                return [4 /*yield*/, zeroEx.getAvailableAddressesAsync()];
            case 1:
                accounts = _a.sent();
                console.log('accounts: ', accounts);
                makerAddress = accounts[0], takerAddress = accounts[1];
                return [4 /*yield*/, zeroEx.token.setUnlimitedProxyAllowanceAsync(ZRX_ADDRESS, makerAddress)];
            case 2:
                setMakerAllowTxHash = _a.sent();
                return [4 /*yield*/, zeroEx.awaitTransactionMinedAsync(setMakerAllowTxHash)];
            case 3:
                _a.sent();
                return [4 /*yield*/, zeroEx.token.setUnlimitedProxyAllowanceAsync(WETH_ADDRESS, takerAddress)];
            case 4:
                setTakerAllowTxHash = _a.sent();
                return [4 /*yield*/, zeroEx.awaitTransactionMinedAsync(setTakerAllowTxHash)];
            case 5:
                _a.sent();
                console.log('Taker allowance mined...');
                ethAmount = new utils_1.BigNumber(1);
                ethToConvert = _0x_js_1.ZeroEx.toBaseUnitAmount(ethAmount, DECIMALS);
                return [4 /*yield*/, zeroEx.etherToken.depositAsync(WETH_ADDRESS, ethToConvert, takerAddress)];
            case 6:
                convertEthTxHash = _a.sent();
                return [4 /*yield*/, zeroEx.awaitTransactionMinedAsync(convertEthTxHash)];
            case 7:
                _a.sent();
                console.log(ethAmount + " ETH -> WETH conversion mined...");
                order = {
                    maker: makerAddress,
                    taker: _0x_js_1.ZeroEx.NULL_ADDRESS,
                    feeRecipient: _0x_js_1.ZeroEx.NULL_ADDRESS,
                    makerTokenAddress: ZRX_ADDRESS,
                    takerTokenAddress: WETH_ADDRESS,
                    exchangeContractAddress: EXCHANGE_ADDRESS,
                    salt: _0x_js_1.ZeroEx.generatePseudoRandomSalt(),
                    makerFee: new utils_1.BigNumber(0),
                    takerFee: new utils_1.BigNumber(0),
                    makerTokenAmount: _0x_js_1.ZeroEx.toBaseUnitAmount(new utils_1.BigNumber(0.2), DECIMALS),
                    takerTokenAmount: _0x_js_1.ZeroEx.toBaseUnitAmount(new utils_1.BigNumber(0.3), DECIMALS),
                    expirationUnixTimestampSec: new utils_1.BigNumber(Date.now() + 3600000)
                };
                orderHash = _0x_js_1.ZeroEx.getOrderHashHex(order);
                shouldAddPersonalMessagePrefix = false;
                return [4 /*yield*/, zeroEx.signOrderHashAsync(orderHash, makerAddress, shouldAddPersonalMessagePrefix)];
            case 8:
                ecSignature = _a.sent();
                signedOrder = __assign({}, order, { ecSignature: ecSignature });
                // Verify that order is fillable
                return [4 /*yield*/, zeroEx.exchange.validateOrderFillableOrThrowAsync(signedOrder)];
            case 9:
                // Verify that order is fillable
                _a.sent();
                shouldThrowOnInsufficientBalanceOrAllowance = true;
                fillTakerTokenAmount = _0x_js_1.ZeroEx.toBaseUnitAmount(new utils_1.BigNumber(0.1), DECIMALS);
                return [4 /*yield*/, zeroEx.exchange.fillOrderAsync(signedOrder, fillTakerTokenAmount, shouldThrowOnInsufficientBalanceOrAllowance, takerAddress)];
            case 10:
                txHash = _a.sent();
                return [4 /*yield*/, zeroEx.awaitTransactionMinedAsync(txHash)];
            case 11:
                txReceipt = _a.sent();
                console.log('FillOrder transaction receipt: ', txReceipt);
                return [2 /*return*/];
        }
    });
}); };
mainAsync()["catch"](console.error);
