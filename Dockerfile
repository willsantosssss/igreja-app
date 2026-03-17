# Multi-stage build to ensure npm run build is executed
ARG BUILD_DATE=unknown
FROM node:22-alpine AS builder
WORKDIR /app
# Copy package files
COPY package.json pnpm-lock.yaml ./
# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile
# Copy source code
COPY . .
# Build the application (this MUST run, not be cached)
# Force rebuild without cache: 2026-03-16T09:10:00Z - updatePassword fix
# Adding ARG to invalidate cache on every build
ARG BUILD_DATE=2026-03-16T09:10:00Z
RUN npm run build
# Production stage
FROM node:22-alpine
WORKDIR /app
# Copy package files
COPY package.json pnpm-lock.yaml ./
# Install production dependencies only
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile
# Copy built application from builder
COPY --from=builder /app/dist ./dist
# Expose port
EXPOSE 3000
# Set environment
ENV NODE_ENV=production
# Start application
CMD ["npm", "run", "start"]
