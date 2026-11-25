FROM node:24-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production PORT=8080 FRONTEND_DIR=/app/frontend/dist
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
COPY backend/node_modules ./node_modules
COPY backend/dist ./dist
COPY backend/prisma ./prisma
COPY backend/prisma7.config.ts ./prisma7.config.ts
COPY frontend/dist /app/frontend/dist
EXPOSE 8080
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy --config prisma7.config.ts && exec node dist/index.js"]
