const User = require('../models/User');
const VerificationToken = require('../models/VerificationToken');
const PasswordResetToken = require('../models/PasswordResetToken');
const argon2 = require('argon2');
const { generateRandomToken, generateOTP } = require('../utils/crypto');
const logger = require('../config/logger');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/email.service');

/**
 * POST /auth/send-otp
 * Sends a 6-digit OTP to the provided email for verification.
 * Does NOT create a user yet — just stores the OTP keyed by email.
 */
const sendOTP = async (req, res, next) => {
  try {
    const { collegeEmail } = req.body;

    if (!collegeEmail) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email is required.' }
      });
    }

    // Check if a user with this email already exists and is verified
    const existingUser = await User.findOne({ collegeEmail });
    if (existingUser && existingUser.emailVerified) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'This email is already registered.' }
      });
    }

    // Delete any previous OTPs for this email
    await VerificationToken.deleteMany({ email: collegeEmail });

    // Generate 6-digit OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await VerificationToken.create({
      email: collegeEmail,
      token: otp,
      expiresAt
    });

    // Send OTP via email
    await sendVerificationEmail(collegeEmail, otp);

    res.status(200).json({
      success: true,
      data: { message: 'OTP sent to your email. It is valid for 10 minutes.' }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/register
 * Accepts user details + OTP. Verifies the OTP, creates user, and auto-logs in.
 */
const register = async (req, res, next) => {
  try {
    const { collegeEmail, rollNumber, password, otp, ...rest } = req.body;

    // 1. Verify OTP first
    if (!otp) {
      console.log('[REGISTER FAIL] No OTP');
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'OTP is required. Please verify your email first.' }
      });
    }

    const otpRecord = await VerificationToken.findOne({ email: collegeEmail, token: otp });
    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      console.log('[REGISTER FAIL] Invalid OTP');
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid or expired OTP. Please request a new one.' }
      });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ $or: [{ collegeEmail }, { rollNumber }] });
    if (existingUser) {
      console.log('[REGISTER FAIL] User already exists');
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'A user with this email or roll number already exists.' }
      });
    }

    // 3. Hash password using argon2id
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

    // 4. Create user (already verified since OTP was confirmed)
    const user = await User.create({
      collegeEmail,
      rollNumber,
      passwordHash,
      emailVerified: true,
      ...rest
    });

    // 5. Consume the OTP
    await VerificationToken.deleteOne({ _id: otpRecord._id });

    // 6. Auto-login: create session
    req.session.userId = user._id;
    req.session.role = user.role;

    res.status(201).json({
      success: true,
      data: {
        message: 'Registration successful. You are now logged in.',
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

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    const verificationRecord = await VerificationToken.findOne({ token });
    if (!verificationRecord || verificationRecord.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid or expired verification token.' }
      });
    }

    if (verificationRecord.userId) {
      const user = await User.findByIdAndUpdate(verificationRecord.userId, { emailVerified: true }, { new: true });
      await VerificationToken.deleteOne({ _id: verificationRecord._id });

      req.session.userId = user._id;
      req.session.role = user.role;

      return res.status(200).json({
        success: true,
        data: {
          message: 'Email verified. You are now logged in.',
          user: { id: user._id, name: user.name, email: user.collegeEmail, role: user.role }
        }
      });
    }

    await VerificationToken.deleteOne({ _id: verificationRecord._id });
    res.status(200).json({
      success: true,
      data: { message: 'Email successfully verified.' }
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
        error: { code: 'AUTH_INVALID_CREDENTIALS', message: 'Invalid credentials' }
      });
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: { code: 'AUTH_INVALID_CREDENTIALS', message: 'Invalid credentials' }
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        error: { code: 'AUTH_EMAIL_NOT_VERIFIED', message: 'Please verify your email before logging in.' }
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        error: { code: 'AUTH_UNAUTHORIZED', message: 'This account has been suspended.' }
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    req.session.userId = user._id;
    req.session.role = user.role;

    res.status(200).json({
      success: true,
      data: {
        message: 'Login successful',
        user: { id: user._id, name: user.name, email: user.collegeEmail, role: user.role }
      }
    });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
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
        error: { code: 'NOT_FOUND', message: 'User not found' }
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

    if (user) {
      const token = generateRandomToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

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
      data: { message: 'If the account is eligible, instructions have been sent.' }
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
        error: { code: 'VALIDATION_ERROR', message: 'Invalid or expired password reset token.' }
      });
    }

    const passwordHash = await argon2.hash(newPassword, { type: argon2.argon2id });
    await User.findByIdAndUpdate(resetRecord.userId, { passwordHash });
    await PasswordResetToken.deleteOne({ _id: resetRecord._id });

    res.status(200).json({
      success: true,
      data: { message: 'Password has been successfully reset. You can now log in.' }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendOTP,
  register,
  verifyEmail,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword
};
