const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  
  declarationAccepted: { type: Boolean, default: false },
  declarationVersion: { type: String },
  declarationAcceptedAt: { type: Date },
  
  status: { type: String, enum: ['ACTIVE', 'BLOCKED', 'REPORTED'], default: 'ACTIVE' }
}, { timestamps: true });

// Ensure unique conversation per report between same participants
conversationSchema.index({ reportId: 1, participants: 1 }, { unique: true });
// General indexing
conversationSchema.index({ participants: 1, updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);

