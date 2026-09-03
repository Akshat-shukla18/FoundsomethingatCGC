const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later.'
    }
  }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT',
      message: 'Too many login attempts, please try again after 15 minutes.'
    }
  }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT',
      message: 'Too many accounts created, please try again later.'
    }
  }
});

const reportCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    error: {
      code: 'REPORT_LIMIT_EXCEEDED',
      message: 'Report creation limit reached. Try again later.'
    }
  }
});

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: {
    success: false,
    error: {
      code: 'SEARCH_LIMIT_EXCEEDED',
      message: 'Too many searches. Please slow down.'
    }
  }
});

module.exports = {
  globalLimiter,
  loginLimiter,
  registerLimiter,
  reportCreationLimiter,
  searchLimiter
};
