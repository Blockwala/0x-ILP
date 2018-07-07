var fs = require("fs");
var Web3 = require("web3");
var config = require("../config/development");
var solc = require('solc');
var localHelper = require('./local-helper');

var deployer = {};

deployer.deployContract = (path, args, solFileName) => {
    if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
    } else {
        // set the provider you want from Web3.providers
        web3 = new Web3(new Web3.providers.HttpProvider(config['node_address']));
    }
    
    var accountCoinbase;
    const ethereumUri = config['node_address'];

    isConnected = () => {
        web3.eth.getAccounts()
            .then(console.log('connected to node at ' + ethereumUri));
        return web3.currentProvider;
    }


    if (!isConnected()) {
        throw new Error('unable to connect to ethereum node at ' + ethereumUri);
    } else {        
        return web3.eth.getAccounts()
            .then((accounts) => {
                accountCoinbase = accounts[0];
                console.log('Unlocking coinbase account ' + accountCoinbase);
                var password = "";
                try {
                    web3.eth.personal.unlockAccount(accountCoinbase, password);
                    console.log("coinbase account " + accountCoinbase + " unlocked");
                } catch(error) {
                    console.log("Error: " + error);
                    return;
                }
    
                /**
                 * Compile Contract and fetch ABI
                 */

                var inputs = {
                    solFileName: fs.readFileSync(path + solFileName).toString(),
                };
                // var source = fs.readFileSync(path);     // (config['contract']);

    
                console.log('compiling contract');
                function findImports(path) {
                    return {
                        'contents': fs.readFileSync(path).toString()
                    }
                }
                var compiledContract = solc.compile({sources: inputs}, 1, findImports);
                console.log("Compiled Contract----->");
                // console.log(compiledContract);
                // todo: write
                console.log("Contract compilation success");

                fs.writeFile('compiled.json', JSON.stringify(compiledContract), function(err) {
                    if (err) throw err;
                    console.log('Compiled & saved');
                });
    
                // Only use if .sol file has just one contract, 
                // otherwise make sure you consider all the contracts in the .sol file
                var contractAbi ;
                var encodedAbi ;
                var bytecode;
                for (let contractName in compiledContract.contracts) {
                    console.log("contractName >>>>"+contractName)
                    bytecode = compiledContract.contracts[contractName].bytecode;
                    contractAbi = JSON.parse(compiledContract.contracts[contractName].interface);
                }
    
                //https://ethereum.stackexchange.com/questions/7255/deploy-contract-from-nodejs-using-web3
                // console.log("abi>>>>>>>>>>>>" +contractAbi + "\n\n");
                // console.log("bytecode>>>>>>>>>>>>"+ bytecode  + "\n\n");
    
                var myContract = new web3.eth.Contract(contractAbi, null, { 
                            data:"0x"+bytecode
                        });
                
                return myContract.deploy({
                    arguments: args
                }).send({
                    from: accountCoinbase,
                    gasPrice: 100000, 
                    gas: 900000
                }).then((instance) => { 
                    contractAddress = instance.options.address;
                    console.log("Contract mined at " + contractAddress);
                    return contractAddress;
                });
            })
            .catch((error) => {
                console.log("Error" + error);
            });
    }
}

module.exports = deployer;