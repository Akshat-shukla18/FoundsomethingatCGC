const User = require('../models/User');
const VerificationToken = require('../models/VerificationToken');
const PasswordResetToken = require('../models/PasswordResetToken');
const argon2 = require('argon2');
const { generateRandomToken } = require('../utils/crypto');
const logger = require('../config/logger');

// Simulated email service
const sendVerificationEmail = async (email, token) => {
  logger.info(`[SIMULATED EMAIL] Sending verification to ${email}. Token: ${token}`);
};

const sendPasswordResetEmail = async (email, token) => {
  logger.info(`[SIMULATED EMAIL] Sending password reset to ${email}. Token: ${token}`);
};

const register = async (req, res, next) => {
  try {
    const { collegeEmail, rollNumber, password, ...rest } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ collegeEmail }, { rollNumber }] });
    if (existingUser) {
      // Don't reveal exact reason to prevent enumeration, but since this is a college app,
      // it's sometimes okay to say email/roll is taken. We will return generic for security.
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'A user with this email or roll number already exists.'
        }
      });
    }

    // Hash password using argon2id
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

    // Create user
    const user = await User.create({
      collegeEmail,
      rollNumber,
      passwordHash,
      ...rest
    });

    // Generate verification token
    const token = generateRandomToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    await VerificationToken.create({
      userId: user._id,
      token,
      expiresAt
    });

    // Send email (async)
    sendVerificationEmail(user.collegeEmail, token);

    res.status(201).json({
      success: true,
      data: {
        message: 'Registration successful. Please check your email to verify your account.',
        userId: user._id
      }
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    const verificationRecord = await VerificationToken.findOne({ token });
    if (!verificationRecord || verificationRecord.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid or expired verification token.'
        }
      });
    }

    await User.findByIdAndUpdate(verificationRecord.userId, { emailVerified: true });
    await VerificationToken.deleteOne({ _id: verificationRecord._id });

    res.status(200).json({
      success: true,
      data: {
        message: 'Email successfully verified. You can now log in.'
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { collegeEmail, password } = req.body;

    const user = await User.findOne({ collegeEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_INVALID_CREDENTIALS',
          message: 'Invalid credentials'
        }
      });
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_INVALID_CREDENTIALS',
          message: 'Invalid credentials'
        }
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTH_EMAIL_NOT_VERIFIED',
          message: 'Please verify your email before logging in.'
        }
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTH_UNAUTHORIZED',
          message: 'This account has been suspended.'
        }
      });
    }

    // Update lastLoginAt
    user.lastLoginAt = new Date();
    await user.save();

    // Create session
    req.session.userId = user._id;
    req.session.role = user.role;

    res.status(200).json({
      success: true,
      data: {
        message: 'Login successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.collegeEmail,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('connect.sid'); // default express-session cookie name
    res.status(200).json({
      success: true,
      data: { message: 'Logged out successfully' }
    });
  });
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { collegeEmail } = req.body;
    const user = await User.findOne({ collegeEmail });

    // "If the account is eligible, instructions have been sent."
    // Prevent email enumeration
    if (user) {
      const token = generateRandomToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Invalidate existing reset tokens for user
      await PasswordResetToken.deleteMany({ userId: user._id });

      await PasswordResetToken.create({
        userId: user._id,
        token,
        expiresAt
      });

      sendPasswordResetEmail(user.collegeEmail, token);
    }

    res.status(200).json({
      success: true,
      data: {
        message: 'If the account is eligible, instructions have been sent.'
      }
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    const resetRecord = await PasswordResetToken.findOne({ token });
    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid or expired password reset token.'
        }
      });
    }

    const passwordHash = await argon2.hash(newPassword, { type: argon2.argon2id });
    await User.findByIdAndUpdate(resetRecord.userId, { passwordHash });
    
    // Invalidate the token
    await PasswordResetToken.deleteOne({ _id: resetRecord._id });

    // Optionally: could destroy all active sessions for this user here (logout all sessions)

    res.status(200).json({
      success: true,
      data: {
        message: 'Password has been successfully reset. You can now log in.'
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword
};

