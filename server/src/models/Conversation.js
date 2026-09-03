const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: false },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  status: { 
    type: String, 
    enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED', 'REPORTED'], 
    default: 'PENDING' 
  },

  lastMessage: {
    text: { type: String },
    type: { type: String, enum: ['TEXT', 'LOCATION', 'SYSTEM'], default: 'TEXT' },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  },

  unreadCounts: {
    type: Map,
    of: Number,
    default: {}
  },

  declarationAccepted: { type: Boolean, default: true },
  declarationVersion: { type: String, default: 'v1.0' },
  declarationAcceptedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexing for rapid queries
conversationSchema.index({ participants: 1, updatedAt: -1 });
conversationSchema.index({ reportId: 1, participants: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
