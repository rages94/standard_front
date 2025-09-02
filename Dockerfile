FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем глобальный конфиг и сайт
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# Создаём папку для кеша
RUN mkdir -p /var/cache/nginx && chown -R nginx:nginx /var/cache/nginx

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
