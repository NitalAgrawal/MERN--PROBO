# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies first (cache layer)
COPY package*.json ./
RUN npm ci --only=production

# ── Production stage ─────────────────────────────────────────────────────────
FROM node:20-alpine AS production

LABEL maintainer="StoryNest Engineering"
LABEL description="StoryNest API — AI-powered memoir creation platform"

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S storynest -u 1001

WORKDIR /app

# Copy production node_modules from base stage
COPY --from=base /app/node_modules ./node_modules

# Copy application source
COPY --chown=storynest:nodejs . .

# Remove dev files
RUN rm -rf .env.example tests/ .git/

# Create upload directory with correct permissions
RUN mkdir -p uploads && chown -R storynest:nodejs uploads

USER storynest

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/v1/health || exit 1

CMD ["node", "server.js"]
