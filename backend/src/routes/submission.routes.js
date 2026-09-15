const express = require('express');
const submissionController = require('../controllers/submission.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Admin submission audit routes
router.use(authenticate, authorize('ADMIN'));

router.get('/assignment/:id', submissionController.getAssignmentAudit);

module.exports = router;
