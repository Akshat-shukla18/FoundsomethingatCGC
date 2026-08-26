const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate.middleware');
const { requireAuth } = require('../middleware/auth.middleware');
const { createReportSchema, updateReportSchema } = require('../validators/report.validator');
const reportController = require('../controllers/report.controller');

// Report Creation
router.post('/', requireAuth, validate(createReportSchema), reportController.createReport);

// Report Feeds
router.get('/lost', reportController.getLostReports);
router.get('/found', reportController.getFoundReports);

// Individual Report operations
router.get('/:id', reportController.getReportById);
router.patch('/:id', requireAuth, validate(updateReportSchema), reportController.updateReport);
router.delete('/:id', requireAuth, reportController.deleteReport);

module.exports = router;

