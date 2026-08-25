# Imagen base ligera de Node.js
FROM node:20-slim

# Instalar FFmpeg en la imagen base
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar paquetes e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el código fuente y compilar
COPY . .
RUN npm run build

# Exponer el puerto de NestJS
EXPOSE 3000

# Comando de inicio
CMD ["node", "dist/main.js"]