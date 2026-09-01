const nodemailer = require('nodemailer');
const logger = require('../config/logger');

// Create a transporter using SMTP
// For production, use Resend, Brevo, SendGrid, etc.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendVerificationEmail = async (toEmail, token) => {
  try {
    if (!process.env.SMTP_HOST) {
      logger.warn('[SIMULATED EMAIL] SMTP credentials not set. Token: ' + token);
      return;
    }

    const mailOptions = {
      from: `"Campus Lost & Found" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: toEmail,
      subject: 'Verify Your Campus Lost & Found Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Welcome to Campus Lost & Found!</h2>
          <p>Thank you for registering. To complete your registration and verify your email address, please enter the following 6-digit OTP code in the application:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 24px 0;">
            <h1 style="font-size: 36px; letter-spacing: 5px; color: #111827; margin: 0;">${token}</h1>
          </div>
          <p>This code will expire in 24 hours.</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">If you did not request this account, you can safely ignore this email.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent to ${toEmail}. Message ID: ${info.messageId}`);
  } catch (error) {
    logger.error(`Error sending verification email to ${toEmail}: ${error.message}`);
    // We don't throw here to avoid crashing the registration flow if email fails
  }
};

const sendPasswordResetEmail = async (toEmail, otp) => {
  try {
    if (!process.env.SMTP_HOST) {
      logger.warn('[SIMULATED EMAIL] SMTP credentials not set. Reset OTP: ' + otp);
      return;
    }

    const mailOptions = {
      from: `"Campus Lost & Found" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: toEmail,
      subject: 'Reset Your Password - Campus Lost & Found',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Password Reset Request</h2>
          <p>We received a request to reset your password. Use the following 6-digit OTP code to reset your password:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 24px 0;">
            <h1 style="font-size: 36px; letter-spacing: 5px; color: #111827; margin: 0;">${otp}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">If you did not request a password reset, please ignore this email.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to ${toEmail}. Message ID: ${info.messageId}`);
  } catch (error) {
    logger.error(`Error sending password reset email to ${toEmail}: ${error.message}`);
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
