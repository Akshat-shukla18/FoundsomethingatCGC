const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['TEXT', 'LOCATION', 'SYSTEM'], default: 'TEXT' },
  text: { type: String, trim: true, maxlength: 2000 },
  locationData: {
    latitude: { type: Number },
    longitude: { type: Number },
    label: { type: String }
  },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date }
}, { timestamps: true });

messageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
