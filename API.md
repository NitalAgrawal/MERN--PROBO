# API Reference — StoryNest

**Base URL:** `http://localhost:5000/api/v1`  
**Auth:** All protected routes require an `accessToken` HTTP-only cookie set by `/auth/login`.  
**Request IDs:** Every request/response includes `x-request-id` header for log correlation.

> **Interactive Docs:** Swagger UI is available at `http://localhost:5000/api/docs`

---

## Authentication

### POST `/auth/register`
Create a new user account.

**Body:**
```json
{ "name": "Rose Agrawal", "email": "rose@example.com", "password": "SecurePass123!" }
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": { "user": { "_id": "...", "name": "Rose Agrawal", "email": "..." } }
}
```

---

### POST `/auth/login`
Login and receive an HTTP-only JWT cookie.

**Body:**
```json
{ "email": "rose@example.com", "password": "SecurePass123!" }
```

**Response `200`:** Sets `accessToken` cookie.

---

### POST `/auth/logout` 🔒
Clear the auth cookie.

**Response `200`:** `{ "success": true, "message": "Logged out successfully." }`

---

### GET `/auth/me` 🔒
Fetch the authenticated user's profile.

**Response `200`:**
```json
{
  "success": true,
  "data": { "user": { "_id": "...", "name": "...", "email": "..." } }
}
```

---

### POST `/auth/forgot-password`
Request a password reset (anti-enumeration — always 200).

**Body:** `{ "email": "rose@example.com" }`

---

## Stories

### GET `/stories` 🔒
List all stories for the authenticated user.

**Response `200`:**
```json
{
  "success": true,
  "data": { "stories": [ { "_id": "...", "title": "...", "status": "Draft", "progress": 10 } ] }
}
```

---

### POST `/stories` 🔒
Create a new story.

**Body:**
```json
{ "title": "Grandma Rose's Story", "subject": "Rose", "relationship": "Grandmother" }
```

**Response `201`:** Returns the created story with `_id` and `progress`.

---

### GET `/stories/:id` 🔒
Get a single story by ID.

---

### PATCH `/stories/:id` 🔒
Update a story's fields.

**Body:** Any subset of story fields.

---

### DELETE `/stories/:id` 🔒
Delete a story and all its associated memories, media, and exports.

---

## Memories

### GET `/stories/:storyId/memories` 🔒
List all memories for a story, ordered by `order` ASC.

---

### POST `/stories/:storyId/memories` 🔒
Add a memory to a story.

**Body:**
```json
{
  "title": "Summer at the Lake",
  "content": "We spent three weeks at the lake every summer...",
  "date": "1985-07-15",
  "location": "Lake Tahoe, CA"
}
```

---

### GET `/memories/:id` 🔒
Get a single memory.

---

### PATCH `/memories/:id` 🔒
Update a memory.

---

### DELETE `/memories/:id` 🔒
Delete a memory and clean up its Cloudinary assets.

---

### POST `/memories/reorder` 🔒
Bulk reorder memories.

**Body:** `{ "storyId": "...", "reorders": [{ "id": "...", "order": 0 }] }`

---

## AI Generation

### POST `/stories/:id/generate` 🔒 ⚡ Rate Limited (10/5min)
Trigger AI memoir book generation for a story.

**Requires:** Story must have at least 1 memory.

**Response `200`:** Returns the updated story with `generatedBook` populated.

**Error `409`:** Generation already in progress.

---

## Exports

### POST `/stories/:storyId/export` 🔒 ⚡ Rate Limited (10/10min)
Export a story book.

**Body:** `{ "format": "pdf" | "epub" | "html" }`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "export": {
      "format": "pdf",
      "fileUrl": "https://res.cloudinary.com/...",
      "fileSize": 204800,
      "pageCount": 47,
      "cached": false,
      "generatedAt": "2026-07-23T12:00:00.000Z"
    }
  }
}
```

---

### GET `/stories/:storyId/exports` 🔒
Get the full export history for a story.

---

## Cover Studio

### POST `/stories/:storyId/generate-cover` 🔒 ⚡ Rate Limited (10/5min)
Generate an AI cover image.

**Body:**
```json
{
  "style": "watercolor",
  "provider": "openai",
  "customInstructions": "Include roses and warm sunset colors",
  "forceRefresh": false
}
```

---

### GET `/stories/:storyId/covers` 🔒
Get all generated covers and supported styles for a story.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "activeCover": { "imageUrl": "...", "style": "watercolor" },
    "coverHistory": [...],
    "styles": [{ "id": "watercolor", "label": "Watercolor", "description": "..." }]
  }
}
```

---

### PATCH `/stories/:storyId/covers/:coverId/select` 🔒
Set a cover from the history as the active cover.

---

## Media Uploads

### POST `/uploads/image` 🔒 ⚡ Rate Limited (20/10min)
Upload an image to a memory. `Content-Type: multipart/form-data`

**Fields:** `file` (binary), `memoryId` (string), `caption` (optional string)

**Limits:** 10MB max, JPEG/PNG/WebP/HEIC/GIF only.

---

### POST `/uploads/voice` 🔒 ⚡ Rate Limited (20/10min)
Upload a voice note to a memory. `Content-Type: multipart/form-data`

**Fields:** `file` (binary), `memoryId` (string)

**Limits:** 50MB max, MP3/WAV/M4A/OGG/WEBM only.

---

### DELETE `/uploads/photo` 🔒
Delete a photo from a memory.

**Body:** `{ "memoryId": "...", "photoId": "..." }`

---

### DELETE `/uploads/voice-note` 🔒
Delete a voice note from a memory.

**Body:** `{ "memoryId": "...", "voiceId": "..." }`

---

## Health & Observability

### GET `/health`
Full server health status. **No auth required.**

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "mongoDB": { "status": "connected" },
    "cloudinary": { "status": "healthy" },
    "aiProvider": { "provider": "openrouter", "status": "healthy" },
    "serverUptimeSeconds": 3600,
    "memoryUsage": { "heapUsed": 45678900 },
    "nodeVersion": "v20.18.0",
    "performanceMetrics": {
      "aiGeneration": { "avgDurationMs": 8420, "count": 12 },
      "exports": { "avgDurationMs": 3200, "count": 5 },
      "uploads": { "avgDurationMs": 890, "count": 34 }
    }
  }
}
```

---

### GET `/ready`
Kubernetes/Docker readiness probe. **No auth required.**

**`200`** if DB is connected. **`503`** if not.

---

## Error Codes

| Code | Meaning |
|---|---|
| `400` | Bad Request — validation error, missing fields |
| `401` | Unauthorized — missing or invalid auth cookie |
| `403` | Forbidden — resource access denied |
| `404` | Not Found — resource doesn't exist |
| `409` | Conflict — duplicate email, concurrent generation |
| `429` | Too Many Requests — rate limit exceeded |
| `500` | Internal Server Error — unexpected failure |

**Error shape:**
```json
{
  "success": false,
  "message": "Human-readable error description.",
  "requestId": "uuid-v4-for-log-correlation"
}
```

---

## 🔒 Legend
- 🔒 — Requires `accessToken` cookie
- ⚡ — Rate limited (limit shown in parentheses)
