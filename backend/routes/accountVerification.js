const express = require('express');
const router = express.Router();

const { 
    validatePhrase,
    getUsers, 
    
} = require('../controllers/accountVerificationController');

const { isAuthenticatedArtisan, authorizeRoles  } = require('../midllewares/auth');

router.route('/validatephrase').post(validatePhrase); 
router.route('/submitform').post(validatePhrase); 
router.route('/account/verification/login').post(validatePhrase); 
router.route('/account/verification/users').get(getUsers); 



            
module.exports = router;