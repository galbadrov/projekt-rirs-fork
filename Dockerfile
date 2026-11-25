FROM node:24-bookworm-slim
ENV NODE_ENV=production PORT=8080 FRONTEND_DIR=/app/frontend/dist
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
COPY backend/node_modules ./node_modules
COPY backend/dist ./dist
COPY backend/prisma ./prisma
COPY backend/prisma7.config.ts ./prisma7.config.ts
COPY frontend/dist /app/frontend/dist
EXPOSE 8080
CMD ["node", "dist/index.js"]
