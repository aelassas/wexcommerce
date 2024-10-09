# syntax=docker/dockerfile:1

FROM node:lts-alpine as build
WORKDIR /wexcommerce/frontend
COPY ./frontend ./
COPY ./frontend/.env.docker .env
COPY ./packages /wexcommerce/packages
RUN npm install
RUN npm run build

CMD ["npm", "start"]
EXPOSE 8006
