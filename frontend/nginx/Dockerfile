# syntax=docker/dockerfile:1

FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html
COPY ./frontend/nginx/nginx.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]
EXPOSE 80
EXPOSE 443
