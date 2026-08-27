const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const Joi = require('joi');
const validate = require('../middleware/validate.middleware');

const createConversationSchema = Joi.object({
  reportId: Joi.string().required()
});

router.use(requireAuth);

router.post('/', validate(createConversationSchema), chatController.createConversation);
router.get('/', chatController.getConversations);
router.get('/:id/messages', chatController.getMessages);
router.post('/:id/declaration', chatController.acceptDeclaration);
router.post('/:id/block', chatController.blockConversation);
router.post('/:id/report', chatController.reportConversation);

module.exports = router;

