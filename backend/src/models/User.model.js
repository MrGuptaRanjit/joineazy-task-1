const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [255, 'Name cannot exceed 255 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password_hash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    role: {
      type: String,
      enum: {
        values: ['STUDENT', 'ADMIN'],
        message: 'Role must be either STUDENT or ADMIN',
      },
      default: 'STUDENT',
      required: true,
      index: true,
    },
    student_id: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true,
      index: true,
      validate: {
        validator: function (v) {
          if (this.role === 'STUDENT') {
            return typeof v === 'string' && v.trim().length > 0;
          }
          return v == null;
        },
        message: 'Student ID is required for student accounts and must be null for admin accounts',
      },
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

const User = mongoose.model('User', userSchema);

module.exports = User;
