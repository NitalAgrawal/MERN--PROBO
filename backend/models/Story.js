const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: [String],
  photo: {
    caption: String,
    aspect: String,
    placeholderStyle: String
  },
  pullQuote: String
});

const reflectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: [String]
});

const aiMetadataSchema = new mongoose.Schema({
  model: String,
  promptVersion: String,
  generationTime: Number
}, { _id: false });

const generatedBookSchema = new mongoose.Schema({
  dedication: String,
  chapters: [chapterSchema],
  reflection: reflectionSchema,
  readingTime: String,
  generatedAt: {
    type: Date,
    default: Date.now
  },
  aiVersion: String,
  aiMetadata: {
    type: aiMetadataSchema,
    default: () => ({})
  }
}, { _id: false });

/**
 * One completed (or failed) export run for a specific format.
 * bookHash is SHA-256(generatedBook JSON) — used to detect whether
 * the book content has changed since the last export, enabling cache reuse.
 */
const exportHistorySchema = new mongoose.Schema({
  format:      { type: String, enum: ['pdf', 'epub', 'html'], required: true },
  status:      { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  fileUrl:     { type: String },          // Cloudinary CDN URL
  publicId:    { type: String },          // Cloudinary public_id for deletion
  fileSize:    { type: Number },          // bytes
  pageCount:   { type: Number },          // PDF/ePub page count
  bookHash:    { type: String },          // SHA-256 of generatedBook at export time
  generatedAt: { type: Date, default: Date.now }
}, { _id: true });

// Each element is one complete generation run — an immutable audit trail
const generationHistorySchema = new mongoose.Schema({
  prompt:         { type: String },
  rawResponse:    { type: String },
  provider:       { type: String },
  model:          { type: String },
  generationTime: { type: Number }, // ms
  createdAt:      { type: Date, default: Date.now }
}, { _id: false });

const storySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required.'],
    trim: true
  },
  relationship: {
    type: String,
    trim: true
  },
  visibility: {
    type: String,
    enum: ['Private', 'Shared', 'Public'],
    default: 'Private'
  },
  status: {
    type: String,
    enum: ['Draft', 'Collecting Memories', 'Generating', 'Ready', 'Published'],
    default: 'Draft'
  },
  coverImage: {
    type: String
  },
  coverGradient: {
    type: String,
    default: 'from-dusty-rose/30 via-soft-beige to-warm-ivory'
  },
  lastEdited: {
    type: Date,
    default: Date.now
  },
  generatedBook: {
    type: generatedBookSchema,
    default: null
  },
  // Immutable audit trail of every generation run — never overwritten
  generationHistory: {
    type: [generationHistorySchema],
    default: []
  },
  // Export history — one entry per format, reused when bookHash matches
  exportHistory: {
    type: [exportHistorySchema],
    default: []
  }
}, {
  timestamps: true
});

// Index for query performance on user dashboard sorting
storySchema.index({ owner: 1, updatedAt: -1 });

const Story = mongoose.model('Story', storySchema);

module.exports = Story;
