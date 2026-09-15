const { body, param } = require('express-validator');

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const createGroupValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Group name is required')
    .isLength({ min: 3, max: 150 }).withMessage('Group name must be between 3 and 150 characters'),
];

const addMemberValidator = [
  param('id')
    .matches(uuidRegex).withMessage('Invalid group ID format'),
  body('identifier')
    .trim()
    .notEmpty().withMessage('Student email or Student ID is required to add/invite a member'),
];

const removeMemberValidator = [
  param('id')
    .matches(uuidRegex).withMessage('Invalid group ID format'),
  param('userId')
    .matches(uuidRegex).withMessage('Invalid user ID format'),
];

module.exports = {
  createGroupValidator,
  addMemberValidator,
  removeMemberValidator,
};
