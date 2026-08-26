const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    collegeEmail: { type: String, required: true, unique: true, lowercase: true, trim: true },
    personalEmail: { type: String, lowercase: true, trim: true },
    rollNumber: { type: String, required: true, unique: true, trim: true },
    department: { type: String, required: true, trim: true },
    semester: { type: Number, required: true },
    classSection: { type: String, required: true, trim: true },
    phoneNumber: { type: String, trim: true },
    telegramId: { type: String, trim: true },

    passwordHash: { type: String, required: true },

    emailVerified: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ['STUDENT', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'],
      default: 'STUDENT',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
    },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);

