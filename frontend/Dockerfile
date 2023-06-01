FROM node:18.15.0

WORKDIR /app

COPY package*.json ./

RUN npm install && npm install axios

COPY . .

COPY vite.config.ts ./

EXPOSE 8080

CMD ["npm", "run", "dev"]