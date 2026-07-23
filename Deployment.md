# Deployment Guide — StoryNest

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 20+ | For local development |
| MongoDB | 7+ | Local or Atlas |
| Docker | 24+ | For containerized deployment |
| Docker Compose | 2.20+ | Included with Docker Desktop |

---

## Option 1 — Docker Compose (Recommended)

The fastest way to run the full stack. One command launches frontend, backend, and MongoDB.

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-org/storynest.git
cd storynest

# 2. Create backend environment file
cp backend/.env.example backend/.env
```

**Edit `backend/.env`** with your real secrets. See [Environment.md](Environment.md) for the full reference.

At minimum, set:
```env
JWT_SECRET=your-strong-32-char-secret
MONGO_URI=mongodb://mongodb:27017/storynest
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-...
```

```bash
# 3. Build and launch all services
docker compose up --build

# Or run in detached mode
docker compose up --build -d
```

### Service URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:80 |
| Backend API | http://localhost:5000 |
| API Docs (Swagger) | http://localhost:5000/api/docs |
| Health Check | http://localhost:5000/api/v1/health |

### Optional: Run with Redis Cache

```bash
docker compose --profile full up --build
```

### Teardown

```bash
docker compose down          # Stop containers
docker compose down -v       # Stop + remove volumes (deletes data)
```

---

## Option 2 — Local Development

### Backend

```bash
cd backend
cp .env.example .env       # Configure your secrets
npm install
npm run dev                # Starts with --watch on port 5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                # Starts Vite on port 5173
```

---

## Option 3 — VPS / Cloud Server Deployment

### Using PM2 (Process Manager)

```bash
# On your server
git clone https://github.com/your-org/storynest.git
cd storynest/backend

cp .env.example .env
# Set NODE_ENV=production and all required secrets

npm ci --only=production
npm install -g pm2

pm2 start server.js --name storynest-api --env production
pm2 save
pm2 startup
```

### Build & Serve Frontend via Nginx

```bash
cd frontend
npm ci
VITE_API_URL=https://api.yourdomain.com/api/v1 npm run build
# Deploy dist/ to your Nginx root
```

### Sample Nginx Config

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/storynest/dist;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## Option 4 — Railway / Render / Fly.io

### Railway

1. Connect your GitHub repository
2. Add a service for `backend/` — set root directory to `backend`
3. Set all environment variables in the Railway dashboard
4. Set start command: `node server.js`

### Render

1. Create a new **Web Service**
2. Root directory: `backend`
3. Build command: `npm ci`
4. Start command: `node server.js`
5. Add all environment variables

---

## Environment Variables for Production

| Variable | Notes |
|---|---|
| `NODE_ENV=production` | Enables JSON logs, sanitized errors |
| `MONGO_URI` | Use MongoDB Atlas for production |
| `CLIENT_URL` | Your frontend's production URL |
| `JWT_SECRET` | Strong random secret (32+ chars) |

> [!IMPORTANT]
> Never commit `.env` to source control. Use secrets management (Railway secrets, GitHub Actions secrets, AWS Secrets Manager, etc.)

---

## Health Checks

The API exposes two health endpoints for load balancers and container orchestrators:

- **`GET /api/v1/health`** — Full status (DB, Cloudinary, AI, metrics)
- **`GET /api/v1/ready`** — Lightweight readiness probe (DB connection only)

Use `/api/v1/ready` for Kubernetes `readinessProbe` and Docker `HEALTHCHECK`.

---

## CI/CD

The included GitHub Actions workflow (`.github/workflows/ci.yml`) automatically:

1. Installs dependencies
2. Lints frontend code
3. Runs backend test suite against a MongoDB service container
4. Builds the frontend production bundle
5. Verifies both Docker images build successfully

All steps must pass for a PR to be mergeable.

---

## Logs in Production

With `NODE_ENV=production`, logs are emitted as structured JSON to stdout.

Aggregate logs using:
- **Docker:** `docker logs storynest_backend -f`
- **Railway/Render:** Built-in log viewer
- **PM2:** `pm2 logs storynest-api`
- **Cloud:** Pipe stdout to Datadog, Logtail, CloudWatch, etc.

Every log line includes `requestId` for end-to-end trace correlation.
