# ---- 构建阶段 ----
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- 运行阶段：Nginx 托管静态文件 ----
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx 配置：SPA 路由 + API 反向代理
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
