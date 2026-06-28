FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY next.config.mjs ./
COPY tsconfig.json ./
COPY next-env.d.ts ./
COPY src ./src

EXPOSE 3000
CMD ["npm", "run", "dev"]
