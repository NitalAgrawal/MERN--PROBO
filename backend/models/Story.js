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
  }
}, {
  timestamps: true
});

// Index for query performance on user dashboard sorting
storySchema.index({ owner: 1, updatedAt: -1 });

const Story = mongoose.model('Story', storySchema);

module.exports = Story;
