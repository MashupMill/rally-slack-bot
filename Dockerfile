FROM node:8-alpine

WORKDIR /usr/src/app

COPY . .
RUN npm install -g npm
RUN npm ci

EXPOSE 8080
ENTRYPOINT ["npm", "start"]
