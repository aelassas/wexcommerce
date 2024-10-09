# syntax=docker/dockerfile:1

FROM node:lts-alpine
WORKDIR /wexcommerce/api
COPY ./api ./
COPY ./api/.env.docker ./.env
COPY ./packages /wexcommerce/packages
RUN npm install
CMD [ "npm", "start"]
EXPOSE 4005
