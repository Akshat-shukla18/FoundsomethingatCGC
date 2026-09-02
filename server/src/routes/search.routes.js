const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');

const { requireAuth } = require('../middleware/auth.middleware');

router.get('/found', searchController.searchFound);
router.post('/autobot', requireAuth, searchController.autobotQuery);

module.exports = router;
