const express = require('express');
const { register, login, logout, forgotPassword, getMe } = require('../controllers/authController');
const { registerSchema, loginSchema, forgotPasswordSchema } = require('../validators/auth.schema');
const validate = require('../validators/validate');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes (with rate limiting and request body validation)
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);

// Protected routes (require JWT verification)
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
