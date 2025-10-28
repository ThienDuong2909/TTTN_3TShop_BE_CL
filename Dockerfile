# ---------- Build stage ----------
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev=false
COPY . .
# Nếu dùng TypeScript:
# RUN npm run build

# ---------- Run stage ----------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
RUN npm ci --omit=dev
EXPOSE 8080
# Yêu cầu nên có endpoint /health trả 200 OK
CMD ["node", "server.js"]
