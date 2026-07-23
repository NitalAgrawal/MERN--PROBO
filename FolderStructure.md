# Folder Structure — StoryNest

```
storynest/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD pipeline
│
├── backend/
│   ├── config/
│   │   ├── cloudinary.js       # Cloudinary SDK initialization
│   │   ├── db.js               # MongoDB connection + graceful shutdown
│   │   └── envValidation.js    # Startup env var validation
│   │
│   ├── constants/
│   │   └── httpStatus.js       # HTTP status code constants
│   │
│   ├── controllers/
│   │   ├── authController.js   # Register, login, logout, getMe
│   │   ├── coverController.js  # AI cover generation & selection
│   │   ├── exportController.js # PDF/EPUB/HTML book export
│   │   ├── healthController.js # Health & readiness endpoints
│   │   ├── memoryController.js # Memory CRUD
│   │   ├── storyController.js  # Story CRUD
│   │   └── uploadController.js # Media upload/delete
│   │
│   ├── docs/
│   │   └── openapi.yaml        # OpenAPI 3.0 specification (Swagger)
│   │
│   ├── middleware/
│   │   ├── auth.js             # JWT protect middleware
│   │   ├── errorHandler.js     # Global Express error handler
│   │   ├── errorLogger.js      # Central error logging middleware
│   │   ├── httpLogger.js       # Pino HTTP request/response logger
│   │   ├── notFound.js         # 404 handler
│   │   ├── rateLimiter.js      # Auth/AI/upload/export rate limiters
│   │   ├── requestId.js        # x-request-id generation & propagation
│   │   └── upload.js           # Multer file upload config
│   │
│   ├── models/
│   │   ├── Memory.js           # Memory Mongoose schema
│   │   ├── Story.js            # Story Mongoose schema
│   │   └── User.js             # User Mongoose schema
│   │
│   ├── prompts/
│   │   └── memoirPrompt.v1.js  # Versioned AI book prompt builder
│   │
│   ├── routes/
│   │   ├── authRoutes.js       # /api/v1/auth/*
│   │   ├── healthRoutes.js     # /api/v1/health, /api/v1/ready
│   │   ├── memoryRoutes.js     # /api/v1/memories/*
│   │   ├── storyRoutes.js      # /api/v1/stories/*
│   │   └── uploadRoutes.js     # /api/v1/uploads/*
│   │
│   ├── services/
│   │   ├── ai/
│   │   │   ├── aiGenerationService.js  # Book generation orchestrator
│   │   │   ├── geminiProvider.js       # Gemini text provider
│   │   │   ├── openaiProvider.js       # OpenAI text provider
│   │   │   ├── openrouterProvider.js   # OpenRouter text provider
│   │   │   └── provider.js             # Base provider interface
│   │   │
│   │   ├── cache/
│   │   │   └── cacheService.js         # Abstract cache (memory + Redis)
│   │   │
│   │   ├── cover/
│   │   │   ├── coverPromptBuilder.js   # AI cover prompt builder
│   │   │   ├── coverService.js         # Cover generation orchestrator
│   │   │   └── providers/
│   │   │       ├── fallbackImageProvider.js  # SVG fallback
│   │   │       ├── geminiImageProvider.js    # Gemini Imagen
│   │   │       ├── ideogramImageProvider.js  # Ideogram AI
│   │   │       ├── openaiImageProvider.js    # DALL-E 3
│   │   │       ├── provider.js               # Base provider
│   │   │       └── stabilityImageProvider.js # Stability AI SDXL
│   │   │
│   │   ├── export/
│   │   │   ├── epubExporter.js     # EPUB generation
│   │   │   ├── exportService.js    # Export orchestrator
│   │   │   ├── htmlExporter.js     # HTML generation
│   │   │   └── pdfExporter.js      # PDF generation (PDFKit)
│   │   │
│   │   ├── logger/
│   │   │   └── logger.js           # Pino logger instance
│   │   │
│   │   ├── metrics/
│   │   │   └── metricsService.js   # Performance metrics tracker
│   │   │
│   │   ├── authService.js          # User creation & lookup
│   │   ├── mediaService.js         # Cloudinary upload/delete
│   │   ├── memoryService.js        # Memory business logic
│   │   └── storyService.js         # Story business logic
│   │
│   ├── tests/
│   │   ├── integration/
│   │   │   ├── auth.test.js        # Auth API integration tests
│   │   │   ├── health.test.js      # Health endpoint tests
│   │   │   └── story.test.js       # Story CRUD integration tests
│   │   ├── unit/
│   │   │   ├── cache.test.js       # CacheService unit tests
│   │   │   ├── metrics.test.js     # MetricsService unit tests
│   │   │   └── requestId.test.js   # RequestId middleware unit tests
│   │   └── cover.test.js           # Cover service tests
│   │
│   ├── uploads/                    # Temporary upload directory
│   ├── utils/
│   │   ├── AppError.js             # Operational error class
│   │   ├── catchAsync.js           # Async handler wrapper
│   │   ├── generateToken.js        # JWT cookie generation
│   │   └── sendResponse.js         # Standardized response helper
│   │
│   ├── validators/
│   │   ├── auth.schema.js          # Zod schemas for auth
│   │   ├── story.schema.js         # Zod schemas for stories
│   │   └── validate.js             # Zod validation middleware
│   │
│   ├── .env                        # Local environment (git-ignored)
│   ├── .env.example                # Environment template
│   ├── Dockerfile                  # Backend production Dockerfile
│   ├── package.json
│   └── server.js                   # Express app entry point
│
├── frontend/
│   ├── public/                     # Static assets
│   ├── src/
│   │   ├── api/                    # Axios API client modules
│   │   ├── components/             # Shared UI components
│   │   ├── context/                # React context providers
│   │   ├── hooks/                  # Custom hooks
│   │   ├── pages/                  # Route-level page components
│   │   └── main.jsx                # React app entry point
│   ├── Dockerfile                  # Frontend production Dockerfile
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── .gitignore
├── Architecture.md
├── API.md
├── Deployment.md
├── Environment.md
├── FolderStructure.md
├── README.md
└── docker-compose.yml
```
