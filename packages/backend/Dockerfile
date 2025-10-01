# Dockerfile for 2LY Orchestrator
FROM node:22-alpine

# Create app directory
WORKDIR /app

# Create logs directory
RUN mkdir -p logs

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY packages/backend/ ./packages/backend/
COPY packages/common/ ./packages/common/

# Install dependencies
RUN npm install

# Install curl
RUN apk add --no-cache curl

# Build the backend
RUN npm run build -w @2ly/backend

# Remove unnecessary node_modules now that we have a build
RUN rm -rf node_modules
RUN rm -rf packages/backend/node_modules
RUN rm -rf packages/common/node_modules

# Create non-root user
RUN addgroup -g 1001 -S orchestrator && \
  adduser -S orchestrator -u 1001

# Change ownership of app directory
RUN chown -R orchestrator:orchestrator /app

# Switch to non-root user
USER orchestrator

# Expose any monitoring ports if needed
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('Health check - orchestrator running')" || exit 1

# Start the application
CMD ["npm", "start", "-w", "@2ly/backend"]