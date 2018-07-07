var express = require('express');
var router = express.Router();

controller = require('./controller.js');
userController = require('../User/controller.js')

// -----------------POST------------------------->

router.post('/project-entries', userController.verifyToken, controller.setProjectEntries);
router.post('/coin-entries', userController.verifyToken, controller.setCoinEntries);
router.post('/deploy-contracts', userController.verifyToken, controller.deployMigrations);


//------------------Get--------------------------->

router.get('/makerDetails/:email', userController.verifyToken, controller.getMakerDetails)
router.get('/contractAddress/:email', controller.getContractAddress);
router.get('/contractDetails/:email', controller.getContractDetails);


module.exports = router;