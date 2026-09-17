const { body, param } = require('express-validator');
const mongoose = require('mongoose');

const isValidObjectId = (val) => mongoose.Types.ObjectId.isValid(val);

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
    .isArray().withMessage('group_ids must be an array of group IDs'),
  body('group_ids.*')
    .optional()
    .custom((val) => isValidObjectId(val)).withMessage('Each group_id must be a valid ObjectId'),
];

const updateAssignmentValidator = [
  param('id')
    .custom((val) => isValidObjectId(val)).withMessage('Invalid assignment ID format'),
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
    .isArray().withMessage('group_ids must be an array of group IDs'),
  body('group_ids.*')
    .optional()
    .custom((val) => isValidObjectId(val)).withMessage('Each group_id must be a valid ObjectId'),
];

const confirmSubmissionValidator = [
  param('id')
    .custom((val) => isValidObjectId(val)).withMessage('Invalid assignment ID format'),
  body('is_confirmed')
    .isBoolean().withMessage('is_confirmed must be a boolean (true) indicating step 1 acknowledgment')
    .custom((val) => val === true).withMessage('You must confirm that you have submitted before submitting'),
];

module.exports = {
  createAssignmentValidator,
  updateAssignmentValidator,
  confirmSubmissionValidator,
};
