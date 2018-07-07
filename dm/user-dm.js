userdb_helper = {};

var UserDB = require('../db/userdb');
var MakerDB = require('../db/makerdb');
var BackerDB = require('../db/backerdb');


/**
 * Checks using the databases if the given user id is a maker or backer
 * @param {_userId} _userId 
 */
userdb_helper.isMaker = (_userId) => {
    return MakerDB.findOne(_userId, {_id: true})
        .then((_id) => {
            if (_id) {
                return _id;
            }
            else {
                return false;
            }
        })
}