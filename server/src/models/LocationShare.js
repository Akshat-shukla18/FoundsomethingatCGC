const mongoose = require('mongoose');

const locationShareSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  
  startedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  
  status: { type: String, enum: ['ACTIVE', 'STOPPED', 'EXPIRED'], default: 'ACTIVE' }
}, { timestamps: true });

// TTL index to automatically remove expired location shares after 24 hours to avoid retaining PII
locationShareSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });

locationShareSchema.index({ conversationId: 1, sharedBy: 1, status: 1 });

module.exports = mongoose.model('LocationShare', locationShareSchema);

