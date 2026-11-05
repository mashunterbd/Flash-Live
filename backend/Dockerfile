FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests and postinstall patch script
COPY package*.json ./
COPY scripts/ scripts/

RUN npm ci

# Copy source code and configuration
COPY tsconfig.json ./
COPY src/ src/

RUN npm run build

# Production Stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
COPY scripts/ scripts/

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/index.js"]

