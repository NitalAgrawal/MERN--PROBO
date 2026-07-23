# Architecture — StoryNest

## System Overview

StoryNest is a full-stack web application with a clear **three-tier architecture**:

```
┌────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                       │
│         React 19 + Vite SPA (TailwindCSS)              │
│         Served via Nginx (Docker) / Vite dev server    │
└────────────────────────────┬───────────────────────────┘
                             │ HTTPS / REST API
┌────────────────────────────▼───────────────────────────┐
│                   APPLICATION LAYER                     │
│              Node.js 20 + Express 5                    │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│   │  Auth    │ │ Stories  │ │Memories  │ │ Exports  ││
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘│
│   ┌──────────────────────────────────────────────────┐ │
│   │             Services Layer                        │ │
│   │  AI  │ Cover │ Export │ Media │ Cache │ Metrics  │ │
│   └──────────────────────────────────────────────────┘ │
└──────────┬──────────────────────────┬──────────────────┘
           │                          │
┌──────────▼──────────┐  ┌───────────▼────────────────────┐
│   DATA LAYER        │  │    EXTERNAL SERVICES           │
│   MongoDB Atlas     │  │  ┌──────────┐ ┌─────────────┐  │
│   (Mongoose ODM)    │  │  │Cloudinary│ │  AI APIs    │  │
│                     │  │  └──────────┘ └─────────────┘  │
│   Redis (optional)  │  │  ┌──────────────────────────┐  │
│   In-Memory Cache   │  │  │ OpenRouter / Gemini /     │  │
└─────────────────────┘  │  │ OpenAI / Ideogram / etc.  │  │
                         │  └──────────────────────────┘  │
                         └────────────────────────────────┘
```

---

## Backend Architecture

### Middleware Stack (Request Pipeline)

```
Request
  → validateEnv (startup only)
  → Helmet (security headers)
  → compression
  → CORS
  → requestId (x-request-id)
  → httpLogger (Pino HTTP)
  → bodyParser (5MB limit)
  → cookieParser
  → mongoSanitize
  → hpp
  → Routes / Rate Limiters
  → errorLogger
  → errorHandler
Response
```

### Rate Limiting Strategy

| Endpoint Group | Limit | Window |
|---|---|---|
| Auth (register/login) | 15 req | 15 min |
| AI Generation | 10 req | 5 min |
| Media Uploads | 20 req | 10 min |
| Exports | 10 req | 10 min |

### Logging Architecture (Pino)

- **Development:** Pretty-printed colorized output
- **Production:** Structured JSON with ISO timestamps
- **Log Levels:** `debug → info → warn → error`
- **Context Fields:** `requestId`, `userId`, `route`, `method`, `responseTime`, `statusCode`
- **Special Loggers:** `logger.logAI()`, `logger.logExport()` for category tagging

### Caching Layer

```
┌──────────────────────────────────────┐
│           CacheService               │
│  ┌─────────────┐  ┌───────────────┐  │
│  │ In-Memory   │  │ Redis (opt.)  │  │
│  │ Map + TTL   │  │ ioredis       │  │
│  └─────────────┘  └───────────────┘  │
│                                      │
│  Cached: story_meta, user_stories,   │
│          cover_meta, export_meta,    │
│          health_status               │
│  NEVER cached: auth/user objects     │
└──────────────────────────────────────┘
```

### AI Generation Pipeline

```
POST /:id/generate
  → 409 guard (no concurrent runs)
  → Load memories sorted by order
  → buildBookPrompt() (versioned v1)
  → Mark story as "Generating"
  → Provider.complete(prompt)
      ↳ OpenRouter | Gemini | OpenAI
  → parseBookJson() (strips markdown fences)
  → Persist generatedBook to Story
  → Append to generationHistory (immutable audit)
  → Mark story as "Ready"
```

### Export Pipeline

```
POST /:storyId/export
  → Check cached export (same bookHash)
  → Load story + book data
  → Format dispatcher:
      PDF  → pdfExporter.js (PDFKit)
      EPUB → epubExporter.js (epub-gen-memory)
      HTML → htmlExporter.js
  → Upload to Cloudinary
  → Cache export metadata 120s
  → Record export duration in MetricsService
```

---

## Security Architecture

| Concern | Solution |
|---|---|
| Auth | JWT in HTTP-only, SameSite=Lax cookies |
| CORS | Strict origin whitelist from env |
| XSS | Helmet CSP headers |
| NoSQL Injection | express-mongo-sanitize |
| HTTP Pollution | hpp middleware |
| Request Size | 5MB body limit |
| Rate Abuse | Endpoint-specific rate limiters |
| Error Leakage | Sanitized error messages in production |
| Secrets | All keys via environment variables |

---

## Data Flow

```
User → Browser → React SPA → Express API → MongoDB
                                  ↓
                             Cloudinary (media)
                             AI Provider (generation)
                             Export Engine (PDF/EPUB/HTML)
```

---

## Performance Metrics

All durations tracked via `MetricsService`:
- `aiGeneration.avgDurationMs` — Average AI book generation time
- `uploads.avgDurationMs` — Average media upload time
- `exports.avgDurationMs` — Average export generation time
- `httpResponse.avgResponseTimeMs` — Rolling average HTTP response time

Accessible at `GET /api/v1/health` under `performanceMetrics`.
