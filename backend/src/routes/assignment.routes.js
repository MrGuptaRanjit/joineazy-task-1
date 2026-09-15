const express = require('express');
const assignmentController = require('../controllers/assignment.controller');
const submissionController = require('../controllers/submission.controller');
const { confirmSubmissionValidator } = require('../validators/assignment.validator');
const validate = require('../middleware/validate.middleware');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// All student assignment routes require student authentication
router.use(authenticate, authorize('STUDENT'));

// Student assignment endpoints
router.get('/', assignmentController.getStudentAssignments);
router.get('/:id', assignmentController.getStudentAssignmentDetails);

// Two-step submission confirmation endpoint
router.post(
  '/:id/submission/confirm',
  validate(confirmSubmissionValidator),
  submissionController.confirmSubmission
);

module.exports = router;
