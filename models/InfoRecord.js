const mongoose = require('mongoose');

const infoRecordSchema = new mongoose.Schema({
  // Medicine-specific fields
  medicineName: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true,
    maxlength: [200, 'Medicine name must be less than 200 characters']
  },
  usage: {
    type: String,
    required: [true, 'Usage/Purpose is required'],
    trim: true,
    maxlength: [500, 'Usage must be less than 500 characters']
  },
  dosage: {
    type: String,
    required: [true, 'Dosage instructions are required'],
    trim: true,
    maxlength: [1000, 'Dosage instructions must be less than 1000 characters']
  },
  exp: {
    type: String,
    required: [true, 'Expiry date is required'],
    trim: true
  },
  man: {
    type: String,
    required: [true, 'Manufacturing date is required'],
    trim: true
  },
  price: {
    type: String,
    required: [true, 'Price is required'],
    trim: true
  },
  btno: {
    type: String,
    required: [true, 'Batch number is required'],
    trim: true,
    maxlength: [100, 'Batch number must be less than 100 characters']
  },
  compName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [200, 'Company name must be less than 200 characters']
  },
  instr: {
    type: String,
    required: [true, 'Storage instructions are required'],
    trim: true,
    maxlength: [1000, 'Storage instructions must be less than 1000 characters']
  },
  drugs: {
    type: String,
    required: [true, 'Drug composition is required'],
    trim: true,
    maxlength: [1000, 'Drug composition must be less than 1000 characters']
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: [true, 'Admin ID is required']
  },
  qrCodeUrl: {
    type: String,
    required: true
  },
  qrCodeImage: {
    type: String, // Base64 encoded QR code image
    required: false
  },
  uniqueId: {
    type: String,
    required: true,
    unique: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  lastViewed: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt field before saving
infoRecordSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

// Index for better query performance
infoRecordSchema.index({ adminId: 1, createdAt: -1 });
infoRecordSchema.index({ uniqueId: 1 });

// Method to increment view count
infoRecordSchema.methods.incrementView = function() {
  this.viewCount += 1;
  this.lastViewed = Date.now();
  return this.save();
};

// Virtual field for formatted creation date
infoRecordSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Ensure virtual fields are serialized
infoRecordSchema.set('toJSON', { virtuals: true });
infoRecordSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('InfoRecord', infoRecordSchema);
