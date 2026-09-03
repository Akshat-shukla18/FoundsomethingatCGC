const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Report = require('../models/Report');
const User = require('../models/User');
const { checkMessageDecorum } = require('../utils/chatModerator');
const { getIo } = require('../websocket');

const initiateConversation = async (req, res, next) => {
  try {
    const { reportId, recipientId, initialMessage } = req.body;
    const userId = req.session.userId;

    let targetUserId = recipientId;
    let reportDoc = null;

    if (reportId) {
      reportDoc = await Report.findById(reportId);
      if (reportDoc) {
        if (!targetUserId) {
          targetUserId = reportDoc.createdBy.toString();
        }
      }
    }

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Recipient is required to start a chat.' }
      });
    }

    if (targetUserId.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Cannot start a conversation with yourself.' }
      });
    }

    // Check if a conversation already exists
    const participants = [userId, targetUserId];
    let query = {
      participants: { $all: participants },
      status: { $ne: 'BLOCKED' }
    };
    if (reportId) {
      query.reportId = reportId;
    }

    let conversation = await Conversation.findOne(query)
      .populate('reportId', 'itemName images reportType location eventAt')
      .populate('participants', 'name rollNumber department collegeEmail');

    if (!conversation) {
      conversation = await Conversation.create({
        reportId: reportId || null,
        participants: [userId, targetUserId],
        initiatedBy: userId,
        status: 'PENDING'
      });

      // Send initial message if provided
      if (initialMessage && initialMessage.trim()) {
        const decorumCheck = checkMessageDecorum(initialMessage);
        if (!decorumCheck.isClean) {
          return res.status(400).json({
            success: false,
            error: { code: 'DECORUM_VIOLATION', message: decorumCheck.reason }
          });
        }

        const msg = await Message.create({
          conversationId: conversation._id,
          senderId: userId,
          receiverId: targetUserId,
          text: initialMessage.trim(),
          type: 'TEXT'
        });

        conversation.lastMessage = {
          text: msg.text,
          type: msg.type,
          senderId: userId,
          createdAt: msg.createdAt
        };

        const currentUnread = conversation.unreadCounts.get(targetUserId.toString()) || 0;
        conversation.unreadCounts.set(targetUserId.toString(), currentUnread + 1);
        await conversation.save();
      }

      conversation = await Conversation.findById(conversation._id)
        .populate('reportId', 'itemName images reportType location eventAt')
        .populate('participants', 'name rollNumber department collegeEmail');
    }

    // Notify via socket
    const io = getIo();
    if (io) {
      io.to(`user:${targetUserId}`).emit('conversation.new', { conversation });
    }

    res.status(201).json({
      success: true,
      data: { conversation }
    });
  } catch (error) {
    next(error);
  }
};

const getConversations = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const conversations = await Conversation.find({ 
      participants: userId,
      status: { $in: ['PENDING', 'ACCEPTED'] }
    })
      .populate('reportId', 'itemName images reportType location eventAt')
      .populate('participants', 'name rollNumber department collegeEmail')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: { conversations }
    });
  } catch (error) {
    next(error);
  }
};

const acceptConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    const conversation = await Conversation.findOne({
      _id: id,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Conversation not found.' }
      });
    }

    conversation.status = 'ACCEPTED';
    await conversation.save();

    const populated = await Conversation.findById(id)
      .populate('reportId', 'itemName images reportType location eventAt')
      .populate('participants', 'name rollNumber department collegeEmail');

    // Notify other participant via socket
    const io = getIo();
    if (io) {
      const otherParticipant = conversation.participants.find(p => p.toString() !== userId.toString());
      if (otherParticipant) {
        io.to(`user:${otherParticipant}`).emit('conversation.accepted', { conversation: populated });
      }
    }

    res.status(200).json({
      success: true,
      data: { conversation: populated }
    });
  } catch (error) {
    next(error);
  }
};

const rejectConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    const conversation = await Conversation.findOne({
      _id: id,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Conversation not found.' }
      });
    }

    conversation.status = 'REJECTED';
    await conversation.save();

    res.status(200).json({
      success: true,
      data: { message: 'Chat request declined.' }
    });
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    const conversation = await Conversation.findOne({
      _id: id,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Conversation not found.' }
      });
    }

    const messages = await Message.find({ conversationId: id })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name rollNumber');

    // Clear unread count for current user
    if (conversation.unreadCounts && conversation.unreadCounts.has(userId.toString())) {
      conversation.unreadCounts.set(userId.toString(), 0);
      await conversation.save();
    }

    res.status(200).json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text, type = 'TEXT', locationData } = req.body;
    const userId = req.session.userId;

    const conversation = await Conversation.findOne({
      _id: id,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Conversation not found.' }
      });
    }

    // Sender restriction if status is PENDING
    if (conversation.status === 'PENDING') {
      const isInitiator = conversation.initiatedBy.toString() === userId.toString();
      if (!isInitiator) {
        return res.status(403).json({
          success: false,
          error: { code: 'REQUEST_NOT_ACCEPTED', message: 'Please accept the chat request first before sending messages.' }
        });
      }
      // If initiator already sent 1 message, prevent spamming until recipient accepts
      const existingCount = await Message.countDocuments({ conversationId: id, senderId: userId });
      if (existingCount >= 1) {
        return res.status(403).json({
          success: false,
          error: { code: 'PENDING_ACCEPTANCE', message: 'Waiting for recipient to accept your chat request before sending more messages.' }
        });
      }
    }

    // Decorum / Profanity Validation for text messages
    if (type === 'TEXT') {
      if (!text || !text.trim()) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Message text cannot be empty.' }
        });
      }
      const decorumCheck = checkMessageDecorum(text);
      if (!decorumCheck.isClean) {
        return res.status(400).json({
          success: false,
          error: { code: 'DECORUM_VIOLATION', message: decorumCheck.reason }
        });
      }
    }

    // Location validation
    if (type === 'LOCATION') {
      if (!locationData || typeof locationData.latitude !== 'number' || typeof locationData.longitude !== 'number') {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Valid latitude and longitude are required for location sharing.' }
        });
      }
    }

    const receiverId = conversation.participants.find(p => p.toString() !== userId.toString());

    const message = await Message.create({
      conversationId: id,
      senderId: userId,
      receiverId,
      type,
      text: type === 'LOCATION' ? 'Shared location' : text.trim(),
      locationData: type === 'LOCATION' ? locationData : undefined
    });

    // Update conversation lastMessage & unread count
    conversation.lastMessage = {
      text: message.text,
      type: message.type,
      senderId: userId,
      createdAt: message.createdAt
    };

    const currentUnread = conversation.unreadCounts.get(receiverId.toString()) || 0;
    conversation.unreadCounts.set(receiverId.toString(), currentUnread + 1);
    conversation.updatedAt = new Date();
    await conversation.save();

    const populatedMessage = await Message.findById(message._id).populate('senderId', 'name rollNumber');

    // Broadcast via socket
    const io = getIo();
    if (io) {
      io.to(id).emit('message.new', populatedMessage);
      io.to(`user:${receiverId}`).emit('notification.unread', {
        conversationId: id,
        message: populatedMessage
      });
    }

    res.status(201).json({
      success: true,
      data: { message: populatedMessage }
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    const conversation = await Conversation.findOne({
      _id: id,
      participants: userId
    });

    if (conversation) {
      await Message.updateMany(
        { conversationId: id, receiverId: userId, isRead: false },
        { $set: { isRead: true, readAt: new Date() } }
      );

      if (conversation.unreadCounts) {
        conversation.unreadCounts.set(userId.toString(), 0);
        await conversation.save();
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

const getUnreadSummary = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(200).json({ success: true, data: { unreadCount: 0, pendingRequestsCount: 0 } });
    }

    const conversations = await Conversation.find({ participants: userId, status: { $in: ['PENDING', 'ACCEPTED'] } });

    let unreadCount = 0;
    let pendingRequestsCount = 0;

    for (const c of conversations) {
      const userUnread = c.unreadCounts ? (c.unreadCounts.get(userId.toString()) || 0) : 0;
      unreadCount += userUnread;

      // If conversation is pending and current user is NOT the initiator, it's an incoming request!
      if (c.status === 'PENDING' && c.initiatedBy && c.initiatedBy.toString() !== userId.toString()) {
        pendingRequestsCount += 1;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        unreadCount,
        pendingRequestsCount,
        hasNotification: unreadCount > 0 || pendingRequestsCount > 0
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  initiateConversation,
  getConversations,
  acceptConversation,
  rejectConversation,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadSummary
};
