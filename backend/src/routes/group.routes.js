const express = require('express');
const groupController = require('../controllers/group.controller');
const {
  createGroupValidator,
  addMemberValidator,
  removeMemberValidator,
} = require('../validators/group.validator');
const validate = require('../middleware/validate.middleware');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// All group routes require authentication
router.use(authenticate);

// Student group routes
router.post('/', authorize('STUDENT'), validate(createGroupValidator), groupController.createGroup);
router.get('/my', authorize('STUDENT'), groupController.getMyGroup);

// General group lookup
router.get('/', groupController.getAllGroups);
router.get('/:id', groupController.getGroupById);

// Student group membership operations
router.post('/:id/members', authorize('STUDENT'), validate(addMemberValidator), groupController.addMember);
router.delete('/:id/members/:userId', authorize('STUDENT'), validate(removeMemberValidator), groupController.removeMember);

module.exports = router;
