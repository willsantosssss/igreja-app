# Simple production Dockerfile - build happens in Procfile
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (build and runtime)
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start application (build happens in Procfile)
CMD ["npm", "run", "start"]
