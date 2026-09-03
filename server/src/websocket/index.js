const { Server } = require('socket.io');
const env = require('../config/env');
const logger = require('../config/logger');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const LocationShare = require('../models/LocationShare');

let io;

const initWebSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: env.CORS_ORIGINS,
      credentials: true
    }
  });

  // Socket Authorization Middleware
  io.use(async (socket, next) => {
    try {
      const userId = socket.handshake.auth.userId;
      if (!userId) {
        return next(new Error("Unauthorized: missing user ID"));
      }
      socket.userId = userId.toString();
      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} for User: ${socket.userId}`);

    // Join personal user room for global notifications
    socket.join(`user:${socket.userId}`);

    // Join rooms for conversations
    socket.on('join_conversation', async ({ conversationId }) => {
      try {
        const conversation = await Conversation.findOne({ 
          _id: conversationId, 
          participants: socket.userId 
        });

        if (conversation && conversation.status !== 'BLOCKED') {
          socket.join(conversationId.toString());
          logger.info(`User ${socket.userId} joined conversation ${conversationId}`);
        } else {
          socket.emit('error', { message: 'Cannot join conversation.' });
        }
      } catch (err) {
        socket.emit('error', { message: 'Error joining conversation' });
      }
    });

    // Leave conversation room
    socket.on('leave_conversation', ({ conversationId }) => {
      socket.leave(conversationId.toString());
    });

    // Typing Indicators
    socket.on('typing.start', ({ conversationId }) => {
      socket.to(conversationId.toString()).emit('typing.start', { userId: socket.userId, conversationId });
    });

    socket.on('typing.stop', ({ conversationId }) => {
      socket.to(conversationId.toString()).emit('typing.stop', { userId: socket.userId, conversationId });
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = {
  initWebSocket,
  getIo: () => io
};
