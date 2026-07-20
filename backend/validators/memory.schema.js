const { z } = require('zod');

const photoSchema = z.object({
  _id: z.string().optional(),
  url: z.string({ required_error: 'Photo URL is required.' }).url('Invalid photo URL.'),
  thumbnailUrl: z.string().optional().nullable(),
  publicId: z.string({ required_error: 'Photo publicId is required.' }),
  width: z.number().optional().nullable(),
  height: z.number().optional().nullable(),
  caption: z.string().trim().optional().nullable(),
  status: z.enum(['uploading', 'uploaded', 'failed']).optional(),
  uploadedAt: z.string().or(z.date()).optional()
});

const voiceNoteSchema = z.object({
  _id: z.string().optional(),
  url: z.string({ required_error: 'Voice note URL is required.' }).url('Invalid voice note URL.'),
  publicId: z.string({ required_error: 'Voice note publicId is required.' }),
  duration: z.number().optional().nullable(),
  status: z.enum(['uploading', 'uploaded', 'failed']).optional(),
  uploadedAt: z.string().or(z.date()).optional()
});

const createMemorySchema = z.object({
  title: z.string().trim().max(100, 'Title cannot exceed 100 characters.').optional().nullable(),
  content: z.string({ required_error: 'Content is required.' }).trim().min(1, 'Content is required.'),
  photos: z.array(photoSchema).default([]),
  voiceNotes: z.array(voiceNoteSchema).default([]),
  date: z.string().trim().max(50, 'Date cannot exceed 50 characters.').optional().nullable(),
  location: z.string().trim().max(100, 'Location cannot exceed 100 characters.').optional().nullable(),
  order: z.number().int().optional(),
}).strict();

const updateMemorySchema = z.object({
  title: z.string().trim().max(100, 'Title cannot exceed 100 characters.').optional().nullable(),
  content: z.string().trim().min(1, 'Content cannot be empty.').optional(),
  photos: z.array(photoSchema).optional(),
  voiceNotes: z.array(voiceNoteSchema).optional(),
  date: z.string().trim().max(50, 'Date cannot exceed 50 characters.').optional().nullable(),
  location: z.string().trim().max(100, 'Location cannot exceed 100 characters.').optional().nullable(),
  order: z.number().int().optional(),
}).strict();

const bulkReorderSchema = z.object({
  reorders: z.array(
    z.object({
      id: z.string({ required_error: 'Memory ID is required for reordering.' }),
      order: z.number({ required_error: 'Order is required.' }).int()
    })
  )
}).strict();

module.exports = { createMemorySchema, updateMemorySchema, bulkReorderSchema };
