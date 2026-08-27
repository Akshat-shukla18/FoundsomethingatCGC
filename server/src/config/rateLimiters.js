const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.'
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again after 15 minutes.'
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many accounts created from this IP, please try again after an hour.'
});

const reportCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Report creation limit reached. Try again later.'
});

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Too many searches. Please slow down.'
});

module.exports = {
  globalLimiter,
  loginLimiter,
  registerLimiter,
  reportCreationLimiter,
  searchLimiter
};

