# Multi-stage build for Node.js application
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install server dependencies
WORKDIR /app/server
RUN npm ci

# Install client dependencies
WORKDIR /app/client
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY --from=deps /app/client/node_modules ./client/node_modules

# Copy source code
COPY server ./server
COPY client ./client

# Build server
WORKDIR /app/server
RUN npm run build

# Build client
WORKDIR /app/client
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built server
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/package*.json ./server/
COPY --from=builder /app/server/node_modules ./server/node_modules

# Copy built client
COPY --from=builder /app/client/dist ./client/dist

# Set working directory to server
WORKDIR /app/server

# Expose port
EXPOSE 4000

# Start the server
CMD ["npm", "run", "start"]

