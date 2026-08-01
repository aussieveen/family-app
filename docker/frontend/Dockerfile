FROM node:22-alpine AS builder

WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci

COPY frontend .
RUN npm run build

FROM nginx:stable-alpine

COPY docker/frontend/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

COPY docker/frontend/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80

# nginx docker image auto-runs envsubst on /etc/nginx/templates/*.template -> /etc/nginx/conf.d/*.conf
CMD ["/start.sh"]
