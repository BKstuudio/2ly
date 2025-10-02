# Dockerfile for 2LY Runtime
FROM node:22-alpine

# Create app directory
WORKDIR /app

# Create logs directory
RUN mkdir -p logs

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY packages/runtime/ ./packages/runtime/
COPY packages/common/ ./packages/common/

# Install dependencies
RUN npm install

# Build the runtime 
RUN npm run build -w @2ly/runtime

# Remove unnecessary node_modules now that we have a build
RUN rm -rf node_modules
RUN rm -rf packages/runtime/node_modules
RUN rm -rf packages/common/node_modules

# Create non-root user
RUN addgroup -g 1001 -S runtime && \
  adduser -S runtime -u 1001

# Change ownership of app directory
RUN chown -R runtime:runtime /app

# Switch to non-root user
USER runtime

# Expose any monitoring ports if needed
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('Health check - runtime running')" || exit 1

# Start the application
CMD ["node", "packages/runtime/dist/index.js"]