# Use Node.js 22 as the base image
FROM node:22-slim AS base

# Install pnpm (pinned to the project packageManager version)
RUN npm install -g pnpm@10.4.1

# Set working directory
WORKDIR /app

# Copy package files needed for install
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the application
RUN pnpm build

# Production image
FROM node:22-slim AS runner

WORKDIR /app

# Copy built files and necessary production files
COPY --from=base /app/dist ./dist
COPY --from=base /app/package.json ./
COPY --from=base /app/pnpm-lock.yaml ./
COPY --from=base /app/server ./server
COPY --from=base /app/shared ./shared
COPY --from=base /app/drizzle ./drizzle

# Install only production dependencies
COPY --from=base /app/patches ./patches
RUN npm install -g pnpm@10.4.1 && pnpm install --prod --frozen-lockfile

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Start the server
CMD ["node", "dist/index.js"]
