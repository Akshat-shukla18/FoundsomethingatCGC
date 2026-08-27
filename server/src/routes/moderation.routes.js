const express = require('express');
const router = express.Router();
const modController = require('../controllers/moderation.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

// Public moderation reporting endpoint
router.post('/reports', requireAuth, modController.submitModerationReport);

// Admin / Moderator endpoints
const adminOnly = requireRole('MODERATOR', 'ADMIN', 'SUPER_ADMIN');

router.get('/admin/reports', adminOnly, modController.getPendingReports);
router.patch('/admin/mod-reports/:id', adminOnly, modController.resolveModerationReport);

router.patch('/admin/items/:id/status', adminOnly, modController.updateItemStatus);
router.patch('/admin/users/:id/status', adminOnly, modController.updateUserStatus);
router.get('/admin/audit-logs', requireRole('ADMIN', 'SUPER_ADMIN'), modController.getAuditLogs);

module.exports = router;

