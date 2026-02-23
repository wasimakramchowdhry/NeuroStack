# ──────────────────────────────────────────────────────────────
# NeuroStack Frontend — Multi-stage Production Dockerfile
# Stage 1: Build the React/Vite app
# Stage 2: Serve with Nginx
# ──────────────────────────────────────────────────────────────

# ── Build Stage ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (cache layer)
COPY package.json package-lock.json* ./
RUN npm install

# Copy source and build
COPY . .

# Vite needs the API URL at build time for production builds
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Production Stage ─────────────────────────────────────────
FROM nginx:alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
