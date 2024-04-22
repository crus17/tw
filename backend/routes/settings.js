const express = require('express');
const router = express.Router();

const { 
    getSettings, 
    createSettings, 
    updateSettings, 
    getStates, 
    getLgas, 
    getTowns, 
    getCategories 
} = require('../controllers/settingsController');

const { isAuthenticatedUser, authorizeRoles } = require('../midllewares/auth');

router.route('/settings').get(getSettings);
router.route('/settings/new').post(isAuthenticatedUser, authorizeRoles('admin'), createSettings)
router.route('/settings/:id').put(isAuthenticatedUser, authorizeRoles('admin'), updateSettings)

router.route('/prefs/states').get(getStates)
router.route('/prefs/lgas/:id').get(getLgas)
router.route('/prefs/towns/:id').get(getTowns)
router.route('/prefs/categories').get(getCategories)


module.exports = router;