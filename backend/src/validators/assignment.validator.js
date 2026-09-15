const { body, param } = require('express-validator');

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const createAssignmentValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Assignment title is required')
    .isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Assignment description is required'),
  body('due_date')
    .notEmpty().withMessage('Due date is required')
    .isISO8601().withMessage('Due date must be a valid ISO 8601 date string'),
  body('onedrive_link')
    .trim()
    .notEmpty().withMessage('OneDrive link is required')
    .isURL().withMessage('OneDrive link must be a valid URL'),
  body('target_type')
    .optional()
    .isIn(['ALL', 'GROUPS']).withMessage("target_type must be either 'ALL' or 'GROUPS'"),
  body('group_ids')
    .optional()
    .isArray().withMessage('group_ids must be an array of group UUIDs'),
  body('group_ids.*')
    .optional()
    .matches(uuidRegex).withMessage('Each group_id must be a valid UUID'),
];

const updateAssignmentValidator = [
  param('id')
    .matches(uuidRegex).withMessage('Invalid assignment ID format'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters'),
  body('description')
    .optional()
    .trim(),
  body('due_date')
    .optional()
    .isISO8601().withMessage('Due date must be a valid ISO 8601 date string'),
  body('onedrive_link')
    .optional()
    .trim()
    .isURL().withMessage('OneDrive link must be a valid URL'),
  body('target_type')
    .optional()
    .isIn(['ALL', 'GROUPS']).withMessage("target_type must be either 'ALL' or 'GROUPS'"),
  body('group_ids')
    .optional()
    .isArray().withMessage('group_ids must be an array of group UUIDs'),
];

const confirmSubmissionValidator = [
  param('id')
    .matches(uuidRegex).withMessage('Invalid assignment ID format'),
  body('is_confirmed')
    .isBoolean().withMessage('is_confirmed must be a boolean (true) indicating step 1 acknowledgment')
    .custom((val) => val === true).withMessage('You must confirm that you have submitted before submitting'),
];

module.exports = {
  createAssignmentValidator,
  updateAssignmentValidator,
  confirmSubmissionValidator,
};
