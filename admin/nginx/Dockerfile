# syntax=docker/dockerfile:1

FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html
COPY ./admin/nginx/nginx.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]
EXPOSE 8001
