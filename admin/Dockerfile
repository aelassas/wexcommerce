# syntax=docker/dockerfile:1

FROM node:lts-alpine AS build
WORKDIR /wexcommerce/admin
COPY ./admin ./
COPY ./admin/.env.docker .env
COPY ./packages /wexcommerce/packages
RUN npm install --force
RUN npm run build

CMD ["npm", "start"]
EXPOSE 8005
