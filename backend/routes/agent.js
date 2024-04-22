const express = require('express');
const router = express.Router();
const { 
    registerAgent, 
    resendActivationToken, 
    activateAgent,
    loginAgent
} = require('../controllers/agentController');

router.route('/register').post(registerAgent);
router.route('/activate').get(resendActivationToken);
router.route('/activate/:token').get(activateAgent);
router.route('/login').post(loginAgent);


module.exports = router;