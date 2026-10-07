FROM node:20-slim

# 1. Instalar SOLO paquetes estrictamente necesarios sin recomendados (-y --no-install-recommends)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# 2. Descargar la versión oficial de yt-dlp
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app

# 3. Copiar manifests e instalar únicamente dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev

# 4. Copiar la compilación dist/ precompilada nativamente en el runner
COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]