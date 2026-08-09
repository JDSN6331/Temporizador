# Stage 1: Build Frontend and Backend Dependencies
FROM node:20-alpine AS builder

WORKDIR /app

# Install native build tools required for C/C++ native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for Vite build)
RUN npm ci

# Copy source files
COPY . .

# Build Vite frontend bundle
RUN npm run build

# Stage 2: Production Container
FROM node:20-alpine AS runner

WORKDIR /app

# Install native build tools for production dependencies
RUN apk add --no-cache python3 make g++

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled frontend dist from builder
COPY --from=builder /app/dist ./dist

# Copy backend server.js script
COPY server.js ./

EXPOSE 3000

# Start Express server
CMD ["node", "server.js"]
