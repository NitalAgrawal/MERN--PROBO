# Environment Variables — StoryNest

All environment variables for the backend are set in `backend/.env`.  
Copy `backend/.env.example` as your starting point.

---

## Required Variables

These must be set or the server will refuse to start:

| Variable | Description | Example |
|---|---|---|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/storynest` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | `your-super-secret-at-least-32-chars` |
| `AI_PROVIDER` | Active AI provider | `openrouter` or `gemini` or `openai` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `my-cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `abcdefghijk...` |

---

## Optional Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | HTTP server port |
| `NODE_ENV` | `development` | `development` / `production` / `test` |
| `CLIENT_URL` | `http://localhost:5173` | CORS allowed origin |
| `LOG_LEVEL` | `debug` (dev), `info` (prod) | Pino log level |
| `COOKIE_SECRET` | Falls back to `JWT_SECRET` | Cookie signing secret |
| `REDIS_URL` | *(none)* | Redis URL — enables Redis cache if set |

---

## AI Provider Keys

Set the key for your active `AI_PROVIDER`:

| Variable | Provider | Notes |
|---|---|---|
| `OPENROUTER_API_KEY` | OpenRouter | Free tier available |
| `GEMINI_API_KEY` | Google Gemini | Also used for Gemini Imagen covers |
| `OPENAI_API_KEY` | OpenAI | Used for text generation + DALL-E covers |

---

## Cover Studio Keys (Optional)

| Variable | Provider |
|---|---|
| `IDEOGRAM_API_KEY` | Ideogram AI |
| `STABILITY_API_KEY` | Stability AI SDXL |

If no cover provider key is configured, the system uses the built-in SVG fallback cover generator.

---

## Example `.env`

```env
# Database
MONGO_URI=mongodb://localhost:27017/storynest

# Auth
JWT_SECRET=replace-with-a-strong-secret-at-least-32-chars
COOKIE_SECRET=another-secret-for-cookie-signing

# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# AI Provider (pick one)
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-...
# GEMINI_API_KEY=AIza...
# OPENAI_API_KEY=sk-...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Cover Image Providers (optional)
# IDEOGRAM_API_KEY=...
# STABILITY_API_KEY=sk-...

# Cache (optional)
# REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=debug
```

---

## Frontend Environment

`frontend/.env`:

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000/api/v1` | Backend API base URL |
