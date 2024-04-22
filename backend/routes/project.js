const express = require('express');
const router = express.Router();

const { 
    getProjects, 
    newProject, 
    getSingleProject, 
    updateProject, 
    deleteProject, 
    createProjectReview,
    getProjectReviews,
    deleteReview,
    getAdminProjects,
    contribute,
    getProjectPunter,
    getMyProjects
} = require('../controllers/projectController');

const { isAuthenticatedUser, authorizeRoles  } = require('../midllewares/auth');
const { loadBookieTicket, newTicket, allTickets } = require('../controllers/ticketController');

router.route('/project/new').post(isAuthenticatedUser, authorizeRoles('admin', 'punter'), newProject); 
router.route('/project/contribute').post(isAuthenticatedUser, authorizeRoles('user'), contribute); 

// Ticket Routes
router.route('/ticket/new').post(isAuthenticatedUser, authorizeRoles('admin', 'punter'), newTicket); 
router.route('/bookie/loadticket').get(isAuthenticatedUser, /*authorizeRoles('admin', 'punter'),*/ loadBookieTicket); 

router.route('/projects').get(isAuthenticatedUser, getProjects); // more roles can be pass to the authorizeRole function like 'admin, editor, superAdmin...'
router.route('/projects/me').get(isAuthenticatedUser, getMyProjects); // more roles can be pass to the authorizeRole function like 'admin, editor, superAdmin...'
router.route('/project/:id').get(getSingleProject);
router.route('/project/punter/:username').get(getProjectPunter);

router.route('/project/:id')
                    .put(isAuthenticatedUser, authorizeRoles('admin', 'punter'), updateProject)
                    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProject);

router.route('/review').put(isAuthenticatedUser, createProjectReview)
router.route('/reviews')
            .get(isAuthenticatedUser, getProjectReviews)
            .delete(isAuthenticatedUser, deleteReview)

router.route('/admin/tickets').get(/*isAuthenticatedUser, authorizeRoles('admin'),*/ allTickets);

            
module.exports = router;