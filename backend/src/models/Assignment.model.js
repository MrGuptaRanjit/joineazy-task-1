const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [255, 'Title cannot exceed 255 characters'],
    },
    description: {
      type: String,
      required: [true, 'Assignment description is required'],
      trim: true,
    },
    due_date: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true,
    },
    onedrive_link: {
      type: String,
      required: [true, 'OneDrive link is required'],
      trim: true,
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+/i.test(v);
        },
        message: 'OneDrive link must be a valid URL starting with http:// or https://',
      },
    },
    target_type: {
      type: String,
      enum: {
        values: ['ALL', 'GROUPS'],
        message: "target_type must be either 'ALL' or 'GROUPS'",
      },
      default: 'ALL',
      required: true,
      index: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator reference is required'],
      index: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
