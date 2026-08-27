const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Report = require('../models/Report');

const DECLARATION_VERSION = "v1.0"; // College approved declaration version

const createConversation = async (req, res, next) => {
  try {
    const { reportId } = req.body;
    const userId = req.session.userId;

    const report = await Report.findById(reportId);
    if (!report || report.status !== 'ACTIVE') {
      return res.status(404).json({
        success: false,
        error: { code: 'REPORT_NOT_FOUND', message: 'Active report not found' }
      });
    }

    if (report.reportType !== 'FOUND') {
      return res.status(403).json({
        success: false,
        error: { code: 'CHAT_NOT_ALLOWED', message: 'Chat is only available for FOUND reports' }
      });
    }

    if (report.createdBy.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Cannot start a conversation with yourself' }
      });
    }

    // Sort participants to ensure consistency for the unique index
    const participants = [userId, report.createdBy].sort();

    let conversation = await Conversation.findOne({ reportId, participants });

    if (!conversation) {
      conversation = await Conversation.create({
        reportId,
        participants
      });
    }

    res.status(201).json({
      success: true,
      data: { conversation }
    });
  } catch (error) {
    if (error.code === 11000) { // Unique constraint
       return res.status(400).json({
         success: false,
         error: { code: 'VALIDATION_ERROR', message: 'Conversation already exists' }
       });
    }
    next(error);
  }
};

const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.session.userId })
      .populate('reportId', 'itemName images reportType')
      .populate('participants', 'name')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: { conversations }
    });
  } catch (error) {
    next(error);
  }
};

const acceptDeclaration = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({ 
      _id: req.params.id, 
      participants: req.session.userId 
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: { code: 'CHAT_CONVERSATION_NOT_FOUND', message: 'Conversation not found' }
      });
    }

    conversation.declarationAccepted = true;
    conversation.declarationVersion = DECLARATION_VERSION;
    conversation.declarationAcceptedAt = new Date();
    await conversation.save();

    res.status(200).json({
      success: true,
      data: { conversation }
    });
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({ 
      _id: req.params.id, 
      participants: req.session.userId 
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: { code: 'CHAT_CONVERSATION_NOT_FOUND', message: 'Conversation not found' }
      });
    }

    if (!conversation.declarationAccepted) {
      return res.status(403).json({
        success: false,
        error: { code: 'CHAT_DECLARATION_REQUIRED', message: 'Must accept declaration first' }
      });
    }

    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 }); // Oldest first for chat UI

    res.status(200).json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    next(error);
  }
};

const blockConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({ 
      _id: req.params.id, 
      participants: req.session.userId 
    });

    if (!conversation) return res.status(404).json({ success: false });
    
    conversation.status = 'BLOCKED';
    await conversation.save();

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

const reportConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({ 
      _id: req.params.id, 
      participants: req.session.userId 
    });

    if (!conversation) return res.status(404).json({ success: false });
    
    conversation.status = 'REPORTED';
    await conversation.save();

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createConversation,
  getConversations,
  acceptDeclaration,
  getMessages,
  blockConversation,
  reportConversation
};

