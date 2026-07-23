# StoryNest 📖

> **AI-powered memoir creation platform** — Capture family stories, add memories and rich media, then let AI weave them into beautiful, exportable memoir books with custom covers.

[![CI](https://github.com/your-org/storynest/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/storynest/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Auth** | JWT HTTP-only cookie authentication |
| 📖 **Stories** | Full CRUD for memoir stories |
| 🧠 **Memories** | Rich memory entries with photos & voice notes |
| 🤖 **AI Generation** | Book generation via OpenRouter, Gemini, or OpenAI |
| 🎨 **Cover Studio** | AI-generated covers (Ideogram, DALL-E, Stability, Gemini Imagen) |
| 📄 **Exports** | PDF, EPUB, and HTML export engine |
| ☁️ **Media** | Cloudinary image & voice note storage |
| 📊 **Observability** | Pino structured logging, request ID tracking, health endpoints |
| 🐳 **Docker** | Single `docker compose up` deployment |

---

## 🚀 Quick Start

### Prerequisites

- [Node.js 20+](https://nodejs.org)
- [MongoDB](https://www.mongodb.com/try/download/community)
- [Docker & Docker Compose](https://docs.docker.com/get-docker/) *(optional)*

### Option 1: Docker (Recommended)

```bash
# Clone
git clone https://github.com/your-org/storynest.git
cd storynest

# Configure secrets
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys

# Launch everything
docker compose up
```

App available at: `http://localhost:80`
API Docs at: `http://localhost:5000/api/docs`

### Option 2: Local Development

```bash
# Backend
cd backend
cp .env.example .env      # Fill in your secrets
npm install
npm run dev               # Starts on port 5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev               # Starts on port 5173
```

---

## 📁 Project Structure

See [FolderStructure.md](FolderStructure.md) for a full breakdown.

---

## 🛠️ Tech Stack

**Backend:** Node.js, Express 5, MongoDB/Mongoose, Pino, Helmet, JWT  
**Frontend:** React 19, Vite, TailwindCSS, Framer Motion  
**AI:** OpenRouter, OpenAI, Google Gemini  
**Media:** Cloudinary  
**Exports:** PDFKit, epub-gen-memory  
**Infrastructure:** Docker, GitHub Actions CI/CD

---

## 📚 Documentation

| Document | Description |
|---|---|
| [Architecture.md](Architecture.md) | System architecture & design decisions |
| [API.md](API.md) | REST API reference |
| [Environment.md](Environment.md) | Environment variables guide |
| [Deployment.md](Deployment.md) | Deployment guide |
| [FolderStructure.md](FolderStructure.md) | Codebase folder structure |

**Interactive API Docs:** `http://localhost:5000/api/docs` (Swagger UI)

---

## 🧪 Testing

```bash
cd backend
npm test               # Run all tests
npm run test:coverage  # With coverage report
```

---

## 📄 License

MIT © StoryNest
