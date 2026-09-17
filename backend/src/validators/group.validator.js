const { body, param } = require('express-validator');
const mongoose = require('mongoose');

const isValidObjectId = (val) => mongoose.Types.ObjectId.isValid(val);

const createGroupValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Group name is required')
    .isLength({ min: 3, max: 150 }).withMessage('Group name must be between 3 and 150 characters'),
];

const addMemberValidator = [
  param('id')
    .custom((val) => isValidObjectId(val)).withMessage('Invalid group ID format'),
  body('identifier')
    .trim()
    .notEmpty().withMessage('Student email or Student ID is required to add/invite a member'),
];

const removeMemberValidator = [
  param('id')
    .custom((val) => isValidObjectId(val)).withMessage('Invalid group ID format'),
  param('userId')
    .custom((val) => isValidObjectId(val)).withMessage('Invalid user ID format'),
];

module.exports = {
  createGroupValidator,
  addMemberValidator,
  removeMemberValidator,
};
