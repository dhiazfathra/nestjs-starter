FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Copy scripts directory for postinstall script
COPY scripts ./scripts/

# Install dependencies
RUN npm ci --ignore-scripts && \
    npm run prisma:generate && \
    npm run build

# Copy application source code
COPY . .

# Remove development dependencies
RUN npm prune --production

# ---
FROM node:22-alpine AS production

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Install utilities for health checks (consolidated RUN commands and added --no-cache)
RUN apk update --no-cache && \
    apk add --no-cache netcat-openbsd wget curl

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Expose the application port
EXPOSE 3000

# Add a script to handle graceful shutdown
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Use the entrypoint script to start the application
CMD ["/app/docker-entrypoint.sh"]

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:${PORT:-3000}/api || exit 1
