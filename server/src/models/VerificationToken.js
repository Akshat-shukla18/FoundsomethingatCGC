const mongoose = require('mongoose');

const verificationTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email: { type: String },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

// TTL index to automatically remove expired tokens
verificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
verificationTokenSchema.index({ email: 1 });

module.exports = mongoose.model('VerificationToken', verificationTokenSchema);
