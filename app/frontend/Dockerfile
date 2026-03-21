# Stage 1: Build the application
FROM node:18-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Docker 배포 시 Nginx가 /api/를 프록시하므로 서버 URL을 비워둠
# VITE_SKIP_CHECKER: Docker 빌드 시 vite-plugin-checker(ESLint) 비활성화
ENV VITE_SERVER_URL=""
ENV VITE_SKIP_CHECKER=1
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 3030

CMD ["nginx", "-g", "daemon off;"]
