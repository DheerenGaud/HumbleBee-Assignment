
FROM node:18-slim AS base

WORKDIR /app

COPY package*.json ./

RUN npm i --production

COPY . .

EXPOSE 8000

CMD ["node", "index.js"]
