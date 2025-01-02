# Base stage
FROM node:20-slim AS base
WORKDIR /app

# Install dependencies necessary for node-gyp and build process
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Dependencies stage
FROM base AS deps
COPY package*.json ./
RUN npm install

# Build stage (this matches your docker-compose.yml target)
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Production stage
FROM node:20-slim AS production
WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public

ENV NODE_ENV=production \
    PORT=3000

EXPOSE 3000
CMD ["node", "dist/index.js"]