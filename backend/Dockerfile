FROM node:22-alpine

# Instalar OpenSSL requerido por Prisma Client en entornos Alpine
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src

EXPOSE 4000
CMD ["npm", "run", "dev"]
