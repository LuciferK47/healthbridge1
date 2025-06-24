# Multi-stage build for production
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S healthbridge -u 1001

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=healthbridge:nodejs /app/dist ./dist
COPY --from=builder --chown=healthbridge:nodejs /app/server/dist ./server/dist
COPY --from=builder --chown=healthbridge:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=healthbridge:nodejs /app/package*.json ./

# Switch to non-root user
USER healthbridge

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/dist/index.js"]