const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true, uppercase: true }, // e.g. SUSPEND_USER, REMOVE_REPORT
  targetType: { type: String, required: true, enum: ['USER', 'REPORT', 'CONVERSATION', 'SYSTEM'] },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  requestId: { type: String }, // Traceability
  metadata: { type: mongoose.Schema.Types.Mixed }, // Minimal, privacy-conscious payload
}, { timestamps: true });

auditLogSchema.index({ actorId: 1, createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

