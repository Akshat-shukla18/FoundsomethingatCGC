const AuditLog = require('../models/AuditLog');
const logger = require('../config/logger');

/**
 * Log an audit event
 */
const logEvent = async ({ actorId, action, targetType, targetId, requestId, metadata = {} }) => {
  try {
    await AuditLog.create({
      actorId,
      action,
      targetType,
      targetId,
      requestId,
      metadata
    });
  } catch (error) {
    // Audit log failures should not crash the main application, but must be monitored
    logger.error(`Failed to create audit log: ${error.message}`);
  }
};

module.exports = {
  logEvent
};

