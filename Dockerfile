FROM ubuntu:18.04

WORKDIR /home/stun


RUN apt-get update
RUN apt-get install -y curl libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libdbus-1-3 \
  libxcb1 libxkbcommon0 libx11-6 libxcomposite1 libxdamage1 libxext6 libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 \
  libcairo2 libasound2 libatspi2.0-0
# Install nodejs
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash
RUN apt-get install -y nodejs

COPY package*.json ./
RUN npm install

COPY .env ./.env
COPY tsconfig.json ./tsconfig.json
COPY types.d.ts ./types.d.ts
COPY ./src ./src

RUN npm run build


CMD [ "npm", "run", "start" ]