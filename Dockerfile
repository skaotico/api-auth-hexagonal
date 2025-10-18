# Etapa 1: Build
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Run
FROM node:20-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist ./dist
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm install --omit=dev

# Exponer el puerto solo como documentación
EXPOSE 3001

# Ejecutar la app
CMD ["node", "dist/main.js"]
