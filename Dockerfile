FROM node:22-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y \
    poppler-utils \
    ghostscript \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir -p uploads processed

EXPOSE 5000

CMD ["npm", "start"]