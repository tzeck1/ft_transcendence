FROM node:lts

WORKDIR /app

COPY package*.json ./

RUN npm install && npm install axios

COPY . .

COPY vite.config.ts ./

EXPOSE 8080

CMD ["npm", "run", "dev"]