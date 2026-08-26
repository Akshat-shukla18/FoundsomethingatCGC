const mongoose = require('mongoose');

const idempotencyRecordSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  path: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  responseStatus: { type: Number, required: true },
  responseBody: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now, expires: 86400 } // TTL 24 hours
});

module.exports = mongoose.model('IdempotencyRecord', idempotencyRecordSchema);

