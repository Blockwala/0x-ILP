dataManipulation = {};

var Maker = require('../db/makerdb');

dataManipulation.create = (db_entry) => {
    return Maker.create(db_entry)
        .then((dbResponse) => {
          return dbResponse;
        })
        .catch((err) => {
            console.log(err);
            throw new Error(err);
        });
}

// dataManipulation.getData = (email) => {
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

module.exports = dataManipulation;