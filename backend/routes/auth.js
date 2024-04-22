const express = require('express');
const router = express.Router();

const { 
    registerUser, 
    loginUser, 
    logout, 
    forgotPassword, 
    resetPassword, 
    getUserProfile,
    updatePassword, 
    updateProfile,
    allUsers,
    getUserDetails,
    updateUser,
    deleteUser,
    changeMode,
    activateUser,
    resendActivationToken,
    keepAlive,
    validateUser,
    requestToken,
    validateToken,
    addBankAccount,
    getBvnDetails,
    registerPunter
} = require ('../controllers/authController');

const { isAuthenticatedUser, authorizeRoles } = require('../midllewares/auth')


router.route('/auth/validateuser').get(validateUser);
router.route('/auth/validatetoken').post(validateToken);
router.route('/auth/requesttoken').get(requestToken);
router.route('/register').post(registerUser);
router.route('/register/punter').post(registerPunter);
router.route('/login').post(loginUser);
router.route('/password/forgot').get(forgotPassword);
router.route('/password/reset').put(resetPassword);
router.route('/password/update').put(isAuthenticatedUser, updatePassword);
router.route('/me').get(isAuthenticatedUser, getUserProfile);
router.route('/me/update').put(isAuthenticatedUser, updateProfile);

router.route('/logout').post(logout);

router.route('/admin/users').get(/*isAuthenticatedUser, authorizeRoles('admin'),*/ allUsers);
router.route('/admin/user/:id')
            .get(isAuthenticatedUser, authorizeRoles('admin'), getUserDetails)
            .put(isAuthenticatedUser, authorizeRoles('admin'), updateUser)
            .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteUser);

router.route('/bvn/validate').get(getBvnDetails);
/*
router.route('/live').get(keepAlive);
router.route('/activate').get(resendActivationToken);
router.route('/activate/:token').get(activateUser);

router.route('/me/changemode').get(isAuthenticatedUser,changeMode)


//*/


module.exports = router;