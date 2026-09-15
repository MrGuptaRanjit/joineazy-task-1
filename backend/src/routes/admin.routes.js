const express = require('express');
const assignmentController = require('../controllers/assignment.controller');
const submissionController = require('../controllers/submission.controller');
const analyticsController = require('../controllers/analytics.controller');
const groupController = require('../controllers/group.controller');
const {
  createAssignmentValidator,
  updateAssignmentValidator,
} = require('../validators/assignment.validator');
const validate = require('../middleware/validate.middleware');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// All admin routes require ADMIN role
router.use(authenticate, authorize('ADMIN'));

// Admin assignment management
router.get('/assignments', assignmentController.getAdminAssignments);
router.post('/assignments', validate(createAssignmentValidator), assignmentController.createAssignment);
router.get('/assignments/:id', assignmentController.getAssignmentById);
router.put('/assignments/:id', validate(updateAssignmentValidator), assignmentController.updateAssignment);
router.delete('/assignments/:id', assignmentController.deleteAssignment);

// Admin submission tracking per assignment
router.get('/assignments/:id/submissions', submissionController.getAssignmentAudit);

// Admin group monitoring & drilldown
router.get('/groups/:id/audit', groupController.getGroupAudit);

// Admin analytics
router.get('/analytics/overview', analyticsController.getOverview);
router.get('/analytics/groups', analyticsController.getGroupAnalytics);
router.get('/analytics/students', analyticsController.getStudentAnalytics);

module.exports = router;
