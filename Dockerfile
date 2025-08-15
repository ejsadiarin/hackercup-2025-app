# Dockerfile for Next.js app

# Builder stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Runner stage
FROM node:20-alpine AS runner
WORKDIR /app

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy public and standalone folders from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./.next/standalone

# Set user
USER nextjs

# Set port
ENV PORT 3000

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", ".next/standalone/server.js"]
