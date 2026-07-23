const dotenv    = require('dotenv');
dotenv.config();

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const compression  = require('compression');
const cookieParser = require('cookie-parser');
const hpp          = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const swaggerUi    = require('swagger-ui-express');
const YAML         = require('yamljs');
const path         = require('path');

const validateEnv         = require('./config/envValidation');
const connectDB           = require('./config/db');
const { configureCloudinary } = require('./config/cloudinary');
const logger              = require('./services/logger/logger');
const httpLogger          = require('./middleware/httpLogger');
const requestId           = require('./middleware/requestId');
const errorLogger         = require('./middleware/errorLogger');
const errorHandler        = require('./middleware/errorHandler');
const notFound            = require('./middleware/notFound');
const { authLimiter, aiLimiter, uploadLimiter, exportLimiter } = require('./middleware/rateLimiter');

const authRoutes    = require('./routes/authRoutes');
const storyRoutes   = require('./routes/storyRoutes');
const memoryRoutes  = require('./routes/memoryRoutes');
const uploadRoutes  = require('./routes/uploadRoutes');
const healthRoutes  = require('./routes/healthRoutes');

// ── Startup: Environment validation ───────────────────────────────────────
validateEnv();

// ── Database & Cloud Services ─────────────────────────────────────────────
connectDB();
configureCloudinary();

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Security Headers (Helmet) ─────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc:   ["'self'", "'unsafe-inline'"],
        imgSrc:     ["'self'", 'data:', 'https://res.cloudinary.com'],
        scriptSrc:  ["'self'"],
        connectSrc: ["'self'"],
        fontSrc:    ["'self'"],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    referrerPolicy: { policy: 'no-referrer' },
  })
);

// ── Response Compression ──────────────────────────────────────────────────
app.use(compression());

// ── CORS Hardening ─────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = process.env.CLIENT_URL || 'http://localhost:5173';
      if (!origin || allowed.split(',').map(o => o.trim()).includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials:     true,
    methods:         ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders:  ['Content-Type', 'Authorization', 'x-request-id'],
    exposedHeaders:  ['x-request-id'],
    maxAge:          86400,
  })
);

// ── Request ID (must come early for log correlation) ─────────────────────
app.use(requestId);

// ── Structured HTTP Logging ───────────────────────────────────────────────
app.use(httpLogger);

// ── Body Parsers with size limits ─────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || process.env.JWT_SECRET));

// ── Security: NoSQL injection & HTTP pollution prevention ────────────────
app.use(mongoSanitize({ replaceWith: '_' }));
app.use(hpp());

// ── Swagger / OpenAPI Documentation ──────────────────────────────────────
try {
  const swaggerDoc = YAML.load(path.join(__dirname, 'docs', 'openapi.yaml'));
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDoc, {
      customSiteTitle: 'StoryNest API Docs',
      customCss: '.swagger-ui .topbar { display: none }',
    })
  );
  logger.info('📚 Swagger UI available at /api/docs');
} catch (err) {
  logger.warn({ err: err.message }, 'Swagger YAML not found — /api/docs unavailable');
}

// ── Health & Readiness Endpoints (no auth, no rate limit) ────────────────
app.use('/api/v1', healthRoutes);

// ── Versioned API Routes with specific rate limiters ─────────────────────
app.use('/api/v1/auth',    authLimiter,   authRoutes);
app.use('/api/v1/stories', storyRoutes);
app.use('/api/v1/memories', memoryRoutes);
app.use('/api/v1/uploads', uploadLimiter, uploadRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────
app.use(notFound);

// ── Central Error Logger → Global Error Handler (order matters) ───────────
app.use(errorLogger);
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(
    { port: PORT, env: process.env.NODE_ENV || 'development' },
    `🚀 StoryNest API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});

module.exports = app;
