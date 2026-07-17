const { z } = require('zod');

// ── Book Sub-schemas ────────────────────────────────────────────────────────
const chapterSchema = z.object({
  title: z.string().min(1, 'Chapter title is required.'),
  content: z.array(z.string()),
  photo: z.object({
    caption: z.string().optional().nullable(),
    aspect: z.string().optional().nullable(),
    placeholderStyle: z.string().optional().nullable()
  }).optional().nullable(),
  pullQuote: z.string().optional().nullable()
});

const reflectionSchema = z.object({
  title: z.string().min(1, 'Reflection title is required.'),
  content: z.array(z.string())
});

const aiMetadataSchema = z.object({
  model: z.string().optional().nullable(),
  promptVersion: z.string().optional().nullable(),
  generationTime: z.number().optional().nullable()
}).optional().nullable();

const generatedBookSchema = z.object({
  dedication: z.string().optional().nullable(),
  chapters: z.array(chapterSchema),
  reflection: reflectionSchema,
  readingTime: z.string().optional().nullable(),
  generatedAt: z.string().or(z.date()).optional(),
  aiVersion: z.string().optional().nullable(),
  aiMetadata: aiMetadataSchema
});

// ── Create Story ──────────────────────────────────────────────────────────────
const createStorySchema = z.object({
  title: z.string().trim().max(100, 'Title cannot exceed 100 characters.').optional().nullable(),
  subtitle: z.string().trim().max(200, 'Subtitle cannot exceed 200 characters.').optional().nullable(),
  subject: z.string({ required_error: 'Who or what this story is about is required.' }).trim().min(1, 'Who or what this story is about is required.'),
  relationship: z.string().trim().max(50, 'Relationship cannot exceed 50 characters.').optional().nullable(),
  visibility: z.enum(['Private', 'Shared', 'Public']).default('Private'),
  status: z.enum(['Draft', 'Collecting Memories', 'Generating', 'Ready', 'Published']).default('Draft'),
  coverImage: z.string().url('Invalid cover image URL.').optional().nullable(),
  coverGradient: z.string().optional().nullable(),
  generatedBook: generatedBookSchema.optional().nullable()
}).strict();

const updateStorySchema = z.object({
  title: z.string().trim().max(100, 'Title cannot exceed 100 characters.').optional().nullable(),
  subtitle: z.string().trim().max(200, 'Subtitle cannot exceed 200 characters.').optional().nullable(),
  subject: z.string().trim().min(1, 'Who or what this story is about is required.').optional(),
  relationship: z.string().trim().max(50, 'Relationship cannot exceed 50 characters.').optional().nullable(),
  visibility: z.enum(['Private', 'Shared', 'Public']).optional(),
  status: z.enum(['Draft', 'Collecting Memories', 'Generating', 'Ready', 'Published']).optional(),
  coverImage: z.string().url('Invalid cover image URL.').optional().nullable(),
  coverGradient: z.string().optional().nullable(),
  generatedBook: generatedBookSchema.optional().nullable()
}).strict();

module.exports = { createStorySchema, updateStorySchema };
