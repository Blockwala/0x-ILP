makerCoinDB_helper = {};

var MakerCoin = require('../db/maker-coindb');
var Maker = require('../db/makerdb');

makerCoinDB_helper.create = (db_entry, user_id) => {
    return Maker.findOne(user_id, {_id: true})
        .then((makerId) => {
            db_entry['maker_id'] = makerId;
            return MakerCoin.create(db_entry);
        }).then((dbResponse) => {
            return dbResponse;
        })
        .catch((err) => {
            console.log(err);
            throw new Error(err);
        });
}

makerCoinDB_helper.getTokenData = (_tokenSymbol) => {
    return MakerCoin.findOne({coin_symbol: _tokenSymbol}, {maker_id: true})
        .then((makerId) => {
            Maker.findOne({_id: maker_id}, {token_address: true})
        }).then((tokenAddress) => {
            return tokenAddress;
        }).catch(err => {
            console.log("Error in getting Token Address");
            console.log(err);
        });
}

// makerCoinDB_helper.getData = (email) => {
//     return User.findOne(email, {_id: true})
//         .then((id) => {
//             return Maker.findOne(id, {coin_name: true,
//                                       coin_symbol: true,
//                                       coin_decimals: true,
//                                       total_supply: true,
//                                       preminted_supply: true,
//                                       cappedSaleStart: true,
//                                       publicSaleStartTime: true,
//                                       publicSaleEndTime: true})
//         });
// }

module.exports = makerCoinDB_helper;