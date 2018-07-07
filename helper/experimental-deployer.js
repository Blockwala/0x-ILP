var fs = require("fs");
var Web3 = require("web3");
var config = require("../config/development");
var solc = require('solc');
var localHelper = require('./local-helper');
// var helper = require('./web3-helper');
// var local-helper = require('./local-helper');

var accountCoinbase;

// Creating a web3 connection
if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    // set the provider you want from Web3.providers
    web3 = new Web3(new Web3.providers.HttpProvider(config['node_address']));
}

const ethereumUri = config['node_address'];
// const address = await web3.eth.getAccounts()[0];

isConnected = () => {
    web3.eth.getAccounts()
        .then(console.log);
    return web3.currentProvider;
}

if (!isConnected()) {
    throw new Error('unable to connect to ethereum node at ' + ethereumUri);
} else {
    console.log('connected to node at ' + ethereumUri);
    web3.eth.getAccounts()
        .then((accounts) => {
            return accounts[0];
        }).then((acc) => {
            console.log('Unlocking coinbase account ' + acc);
            var password = "";
            try {
                web3.eth.personal.unlockAccount(acc, password);
                accountCoinbase = acc
                console.log("coinbase account " + acc + " unlocked");
            } catch(error) {
                console.log("Error: " + error);
                return;
            }

            /**
             * Compile Contract and fetch ABI
             */
            var source = fs.readFileSync(config['contract']);

            console.log('compiling contract');
            var compiledContract = solc.compile(source.toString(), 1);
            console.log("Contract compilation success");

            // Only use if .sol file has just one contract, 
            // otherwise make sure you consider all the contracts in the .sol file
            var contractAbi ;
            var encodedAbi ;
            var bytecode;

            for (let contractName in compiledContract.contracts) {
                bytecode = compiledContract.contracts[contractName].bytecode;
                contractAbi = JSON.parse(compiledContract.contracts[contractName].interface);
            }

            //https://ethereum.stackexchange.com/questions/7255/deploy-contract-from-nodejs-using-web3
            console.log("abi>>>>>>>>>>>>" +contractAbi + "\n\n");
            console.log("bytecode>>>>>>>>>>>>"+ bytecode  + "\n\n");

            var myContract = new web3.eth.Contract(contractAbi, null, { 
                        data:"0x"+bytecode
                    });
            
            var averageGasPrice;
            web3.eth.getGasPrice()
                .then((gasPrice) => {
                    console.log("Average gas price: " + averageGasPrice);
                    averageGasPrice = gasPrice;
                })
                .catch(console.error);
    
            var estimatedGas;
            myContract.deploy().estimateGas()
                .then((gas) => {
                    console.log("Estimated gas: " + estimatedGas);
                    estimatedGas = gas;
                })
                .catch(console.error);
    

            myContract.deploy().send({
                from: accountCoinbase,
                gasPrice: averageGasPrice, 
                gas: estimatedGas
            }).then((instance) => { 
                console.log("Contract mined at " + instance.options.address);
                helloInstance = instance; 
            });
        })
        .catch((error) => {
            console.log(error)
        })
}

