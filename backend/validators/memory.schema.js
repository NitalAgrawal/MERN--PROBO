const { z } = require('zod');

const createMemorySchema = z.object({
  title: z.string().trim().max(100, 'Title cannot exceed 100 characters.').optional().nullable(),
  content: z.string({ required_error: 'Content is required.' }).trim().min(1, 'Content is required.'),
  photos: z.array(z.string()).default([]),
  voiceNote: z.string().optional().nullable(),
  date: z.string().trim().max(50, 'Date cannot exceed 50 characters.').optional().nullable(),
  location: z.string().trim().max(100, 'Location cannot exceed 100 characters.').optional().nullable(),
  order: z.number().int().optional(),
}).strict();

const updateMemorySchema = z.object({
  title: z.string().trim().max(100, 'Title cannot exceed 100 characters.').optional().nullable(),
  content: z.string().trim().min(1, 'Content cannot be empty.').optional(),
  photos: z.array(z.string()).optional(),
  voiceNote: z.string().optional().nullable(),
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
