const crypto = require('crypto');

/**
 * Generates a cryptographically secure random token
 * @param {number} bytes - number of bytes
 * @returns {string} hex string
 */
const generateRandomToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

module.exports = {
  generateRandomToken,
};

