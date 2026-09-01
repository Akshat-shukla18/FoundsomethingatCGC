const crypto = require('crypto');

/**
 * Generates a cryptographically secure random token
 * @param {number} bytes - number of bytes
 * @returns {string} hex string
 */
const generateRandomToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Generates a 6-digit numeric OTP
 * @returns {string} 6-digit string
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = {
  generateRandomToken,
  generateOTP,
};

