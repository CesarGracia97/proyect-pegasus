FROM node:20-slim

# 1. Instalar FFmpeg, Python3, curl y certificados de seguridad
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# 2. Descargar la versión oficial más reciente de yt-dlp para Linux y asignarle permisos de ejecución
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app

# 3. Copiar paquetes e instalar dependencias
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]