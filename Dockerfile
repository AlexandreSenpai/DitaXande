FROM node:16-slim
WORKDIR /app

COPY package.json tsconfig.json tsconfig.release.json /app/
COPY . .
RUN npm install & npm install -g typescript

RUN npm run build

CMD [ "node", "/app/build/index.js" ]
