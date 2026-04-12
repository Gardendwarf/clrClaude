# -- clrClaude -- Multi-stage production build --
# Stage 1: Build the Vite app
# Stage 2: Serve static files via Nginx

FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy source and build
COPY . .

# Vite bakes env vars at build time -- these get replaced by
# the entrypoint script at container start for runtime flexibility
ARG VITE_SUPABASE_URL=__VITE_SUPABASE_URL__
ARG VITE_SUPABASE_ANON_KEY=__VITE_SUPABASE_ANON_KEY__

RUN npm run build

# Stage 2: Nginx to serve the static build
FROM nginx:1.27-alpine

# Copy custom nginx config and security headers
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY security-headers.conf /etc/nginx/security-headers.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Runtime env var injection script
# Replaces placeholder strings in the built JS with actual env vars at startup
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
