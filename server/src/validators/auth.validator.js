const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().required().trim().min(2).max(100),
  collegeEmail: Joi.string().email().required().lowercase().trim(),
  personalEmail: Joi.string().email().lowercase().trim().optional(),
  rollNumber: Joi.string().required().trim().min(2).max(50),
  department: Joi.string().required().trim().max(100),
  semester: Joi.number().required().min(1).max(10),
  classSection: Joi.string().required().trim().max(20),
  phoneNumber: Joi.string().trim().max(20).optional(),
  telegramId: Joi.string().trim().max(50).optional(),
  password: Joi.string().required().min(8).max(128),
  otp: Joi.string().required().length(6).pattern(/^\d+$/).messages({
    'string.length': 'OTP must be exactly 6 digits',
    'string.pattern.base': 'OTP must contain only numbers'
  })
});

const loginSchema = Joi.object({
  collegeEmail: Joi.string().email().required().lowercase().trim(),
  password: Joi.string().required()
});

const verifyEmailSchema = Joi.object({
  token: Joi.string().required()
});

const forgotPasswordSchema = Joi.object({
  collegeEmail: Joi.string().email().required().lowercase().trim()
});

const resetPasswordSchema = Joi.object({
  collegeEmail: Joi.string().email().required().lowercase().trim(),
  otp: Joi.string().required().length(6).pattern(/^\d+$/).messages({
    'string.length': 'OTP must be exactly 6 digits',
    'string.pattern.base': 'OTP must contain only numbers'
  }),
  newPassword: Joi.string().required().min(8).max(128)
});

module.exports = {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};

