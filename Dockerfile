# ============================================================
# Stage 1: Build the React frontend
# ============================================================
FROM node:20-alpine AS build

WORKDIR /app

# Install build tools (needed for native modules like better-sqlite3)
RUN apk add --no-cache python3 make g++

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Fix Tailwind binary issue (optional but safe)
RUN npm install @tailwindcss/oxide-linux-x64-musl -f

# Copy frontend source
COPY index.html vite.config.mjs ./
COPY src/ ./src/

# Build frontend
RUN npm run build

# ============================================================
# Stage 2: Production runtime
# ============================================================
FROM node:18-alpine

WORKDIR /app

# Install build tools for sqlite
RUN apk add --no-cache python3 make g++

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && \
    npm rebuild better-sqlite3 && \
    apk del python3 make g++

# 🔥 COPY FULL APP (IMPORTANT FIX)
COPY . .

# Copy built frontend from Stage 1
COPY --from=build /app/dist ./dist

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Security: run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# Start server
CMD ["node", "server.js"]
