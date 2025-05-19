FROM node:22-alpine@sha256:152270cd4bd094d216a84cbc3c5eb1791afb05af00b811e2f0f04bdc6c473602 AS builder

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
FROM node:22-alpine@sha256:152270cd4bd094d216a84cbc3c5eb1791afb05af00b811e2f0f04bdc6c473602 AS production

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Install utilities for health checks (consolidated RUN commands and added --no-cache)
RUN apk update --no-cache && \
    apk add --no-cache netcat-openbsd=1.130-r5 wget=1.21.4-r0 curl=8.5.0-r0

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
