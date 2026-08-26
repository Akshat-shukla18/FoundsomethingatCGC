const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  objectKey: { type: String, required: true },
  mimeType: { type: String },
  size: { type: Number },
  width: { type: Number },
  height: { type: Number }
}, { _id: false });

const reportSchema = new mongoose.Schema(
  {
    reportType: { 
      type: String, 
      enum: ['LOST', 'FOUND'], 
      required: true 
    },
    itemName: { type: String, required: true, trim: true },
    normalizedItemName: { type: String, lowercase: true, trim: true },
    description: { type: String, required: true },
    normalizedSearchText: { type: String, lowercase: true },
    
    category: { type: String, trim: true },
    color: { type: String, trim: true },
    brand: { type: String, trim: true },
    
    images: [imageSchema],
    
    location: {
      label: { type: String, required: true, trim: true }
    },
    
    eventAt: { type: Date, required: true },
    timePrecision: { 
      type: String, 
      enum: ['EXACT', 'APPROXIMATE', 'UNKNOWN'], 
      default: 'APPROXIMATE' 
    },
    
    additionalInfo: { type: String },
    
    contactPreferences: {
      email: { type: Boolean, default: false },
      name: { type: Boolean, default: false },
      department: { type: Boolean, default: false },
      rollNumber: { type: Boolean, default: false },
      phoneNumber: { type: Boolean, default: false },
      telegramId: { type: Boolean, default: false },
      classSection: { type: Boolean, default: false }
    },
    
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    
    status: { 
      type: String, 
      enum: ['ACTIVE', 'CLAIM_PENDING', 'RESOLVED', 'EXPIRED', 'REMOVED'], 
      default: 'ACTIVE' 
    }
  },
  { timestamps: true }
);

// Required Database Indexes per spec
reportSchema.index({ reportType: 1, status: 1, createdAt: -1 });
reportSchema.index({ reportType: 1, status: 1, eventAt: -1 });
reportSchema.index({ createdBy: 1, createdAt: -1 });

// Text index for basic search
reportSchema.index({ 
  normalizedItemName: 'text', 
  normalizedSearchText: 'text', 
  category: 'text', 
  color: 'text', 
  brand: 'text',
  'location.label': 'text' 
});

module.exports = mongoose.model('Report', reportSchema);

