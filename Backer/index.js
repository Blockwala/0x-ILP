var express = require('express');
var router = express.Router();

controller = require('./controller.js');
userController = require('../User/controller.js')

// -----------------POST------------------------->

router.post('/backer-kyc', userController.verifyToken, controller.createBacker);
router.post('/process-order', userController.verifyToken, controller.processOrder);


//------------------Get--------------------------->

router.get('/get-maker/:maker_id', controller.getMakerDetails);

module.exports = router;