const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  storyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
    required: true,
    index: true
  },
  title: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required.'],
    trim: true
  },
  photos: [{
    url: { type: String, required: true },
    thumbnailUrl: { type: String },
    publicId: { type: String, required: true },
    width: { type: Number },
    height: { type: Number },
    caption: { type: String, trim: true },
    status: { type: String, enum: ['uploading', 'uploaded', 'failed'], default: 'uploaded' },
    uploadedAt: { type: Date, default: Date.now }
  }],
  voiceNotes: [{
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    duration: { type: Number },
    status: { type: String, enum: ['uploading', 'uploaded', 'failed'], default: 'uploaded' },
    uploadedAt: { type: Date, default: Date.now }
  }],
  date: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  order: {
    type: Number,
    default: 0,
    index: true
  }
}, {
  timestamps: true
});

// Compound index on storyId and order for faster loading and sorting
memorySchema.index({ storyId: 1, order: 1 });

const Memory = mongoose.model('Memory', memorySchema);

module.exports = Memory;
