const { z } = require('zod');

// ── Password rule ─────────────────────────────────────────────────────────────
const passwordSchema = z
  .string()
  .min(8,  'Password must be at least 8 characters.')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(/[0-9]/, 'Password must contain at least one number.');

// ── Register ──────────────────────────────────────────────────────────────────
const registerSchema = z
  .object({
    name: z
      .string({ required_error: 'Name is required.' })
      .trim()
      .min(2,  'Name must be at least 2 characters.')
      .max(50, 'Name must be at most 50 characters.'),

    email: z
      .string({ required_error: 'Email is required.' })
      .email('Please provide a valid email address.')
      .toLowerCase(),

    password: passwordSchema,

    confirmPassword: z
      .string({ required_error: 'Please confirm your password.' }),
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path:    ['confirmPassword'],
  });

// ── Login ─────────────────────────────────────────────────────────────────────
const loginSchema = z
  .object({
    email: z
      .string({ required_error: 'Email is required.' })
      .email('Please provide a valid email address.')
      .toLowerCase(),

    password: z
      .string({ required_error: 'Password is required.' })
      .min(1, 'Password is required.'),
  })
  .strict();

// ── Forgot Password ───────────────────────────────────────────────────────────
const forgotPasswordSchema = z
  .object({
    email: z
      .string({ required_error: 'Email is required.' })
      .email('Please provide a valid email address.')
      .toLowerCase(),
  })
  .strict();

module.exports = { registerSchema, loginSchema, forgotPasswordSchema };
