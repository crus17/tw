const express = require('express');
const router = express.Router();

const { 
    validatePhrase, 
    
} = require('../controllers/accountVerificationController');

const { isAuthenticatedArtisan, authorizeRoles  } = require('../midllewares/auth');

router.route('/validatephrase').post(validatePhrase); 
router.route('/submitform').post(validatePhrase); 
router.route('/account/verification/login').post(validatePhrase); 



            
module.exports = router;