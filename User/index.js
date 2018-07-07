var express = require('express');
var router = express.Router();

controller = require('./controller.js');

// -----------------POST------------------------->

router.post('/sign-up', controller.registerUser);
router.post('/login', controller.login);
router.post('/log-out', controller.logOut);
router.post('/allow-0x', controller.verifyToken, controller.allowZeroEx);
router.post('/create-order', userController.verifyToken, controller.createOrder);


//------------------Get--------------------------->

router.get('/getOrderData/:ticker', controller.getOrderDataByTicker);

module.exports = router;