const express = require('express');
const authRoutes = require('./auth.routes');
const groupRoutes = require('./group.routes');
const assignmentRoutes = require('./assignment.routes');
const submissionRoutes = require('./submission.routes');
const adminRoutes = require('./admin.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/groups', groupRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/submissions', submissionRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
