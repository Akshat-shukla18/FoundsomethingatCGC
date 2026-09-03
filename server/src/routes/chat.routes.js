const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth.middleware');
const chatController = require('../controllers/chat.controller');

// Unread badge summary for navbar indicator
router.get('/unread-summary', requireAuth, chatController.getUnreadSummary);

// Conversations management
router.get('/', requireAuth, chatController.getConversations);
router.post('/initiate', requireAuth, chatController.initiateConversation);

// Individual conversation actions
router.patch('/:id/accept', requireAuth, chatController.acceptConversation);
router.patch('/:id/reject', requireAuth, chatController.rejectConversation);
router.patch('/:id/read', requireAuth, chatController.markAsRead);

// Messages inside conversation
router.get('/:id/messages', requireAuth, chatController.getMessages);
router.post('/:id/messages', requireAuth, chatController.sendMessage);

module.exports = router;
