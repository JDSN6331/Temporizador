# Stage 1: Build Frontend and Backend Dependencies
FROM node:20-alpine AS builder

WORKDIR /app

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

# Set environment
ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/app/data/database.sqlite

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled frontend dist from builder
COPY --from=builder /app/dist ./dist

# Copy backend server.js script
COPY server.js ./

# Create data directory for persistent SQLite storage
RUN mkdir -p /app/data

# Mount persistent volume for SQLite database
VOLUME ["/app/data"]

EXPOSE 3000

# Start Express server
CMD ["node", "server.js"]
