FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm config set strict-ssl false

RUN npm install --no-audit --no-fund

COPY . .

RUN npm run build

EXPOSE 4000

CMD ["npm", "start"]