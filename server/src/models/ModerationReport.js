const mongoose = require('mongoose');

const moderationReportSchema = new mongoose.Schema({
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, required: true, enum: ['REPORT', 'CONVERSATION', 'USER'] },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  
  reason: { 
    type: String, 
    required: true, 
    enum: ['spam', 'harassment', 'false information', 'inappropriate content', 'fraud/scam', 'privacy violation', 'other'] 
  },
  details: { type: String, maxlength: 1000 },
  
  status: { type: String, enum: ['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'], default: 'PENDING' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date }
}, { timestamps: true });

moderationReportSchema.index({ status: 1, createdAt: -1 });
moderationReportSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('ModerationReport', moderationReportSchema);

