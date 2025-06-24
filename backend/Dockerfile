# syntax=docker/dockerfile:1

FROM node:lts-alpine
WORKDIR /wexcommerce/backend
COPY ./backend ./
COPY ./backend/.env.docker ./.env
COPY ./packages /wexcommerce/packages
RUN npm install
RUN npm run setup
CMD [ "npm", "start"]
EXPOSE 4005
