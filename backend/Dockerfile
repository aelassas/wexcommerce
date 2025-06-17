# syntax=docker/dockerfile:1

FROM node:lts-alpine
WORKDIR /wexcommerce/backend
COPY ./backend ./
COPY ./backend/.env.docker ./.env
COPY ./packages /wexcommerce/packages
RUN npm install
CMD [ "npm", "start"]
EXPOSE 4005
