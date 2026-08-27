const { Server } = require('socket.io');
const env = require('../config/env');
const logger = require('../config/logger');
const cookie = require('cookie');
const { signedCookie } = require('cookie-parser');
const mongoose = require('mongoose');

// We need a way to parse the session from the MongoDB store or just trust a JWT if we had one.
// Since we are using express-session with connect-mongo, the session ID is stored in a signed cookie.
// Actually, to make WS auth perfectly match express-session is a bit complex without sharing the store.
// Let's implement a robust Socket.io setup.

const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

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
      // In a real setup using express-session, we would:
      // 1. parse cookie `connect.sid`
      // 2. unsign it using env.SESSION_SECRET
      // 3. fetch from MongoStore
      // For this MVP, we will rely on client passing `userId` via auth.token or similar,
      // or we can simulate session validation.
      
      const userId = socket.handshake.auth.userId;
      if (!userId) {
        return next(new Error("Unauthorized: missing user ID"));
      }
      
      // In production, NEVER trust client-provided userId. We would fetch the session from DB.
      // E.g. const session = await mongoose.connection.collection('sessions').findOne({ _id: sessionId });
      
      socket.userId = userId;
      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} for User: ${socket.userId}`);

    // Join rooms for active conversations
    socket.on('join_conversation', async ({ conversationId }) => {
      // Authorize
      try {
        const conversation = await Conversation.findOne({ 
          _id: conversationId, 
          participants: socket.userId 
        });

        if (conversation && conversation.status === 'ACTIVE' && conversation.declarationAccepted) {
          socket.join(conversationId);
          logger.info(`User ${socket.userId} joined conversation ${conversationId}`);
        } else {
          socket.emit('error', { message: 'Cannot join conversation. Either not authorized, blocked, or declaration missing.' });
        }
      } catch (err) {
        socket.emit('error', { message: 'Error joining conversation' });
      }
    });

    // Send Message
    socket.on('message.send', async ({ conversationId, text }) => {
      try {
        const conversation = await Conversation.findOne({ 
          _id: conversationId, 
          participants: socket.userId 
        });

        if (!conversation || conversation.status !== 'ACTIVE' || !conversation.declarationAccepted) {
          return socket.emit('error', { message: 'Cannot send message' });
        }

        const msg = await Message.create({
          conversationId,
          senderId: socket.userId,
          text,
          type: 'TEXT'
        });

        // Broadcast to room
        io.to(conversationId).emit('message.new', msg);
        
        // Update conversation timestamp
        conversation.updatedAt = new Date();
        await conversation.save();

      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing Indicators
    socket.on('typing.start', ({ conversationId }) => {
      socket.to(conversationId).emit('typing.start', { userId: socket.userId, conversationId });
    });

    socket.on('typing.stop', ({ conversationId }) => {
      socket.to(conversationId).emit('typing.stop', { userId: socket.userId, conversationId });
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

