# Etapa 1: Compilación de Angular
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build -- --configuration production

# Etapa 2: Servidor Web Nginx
FROM nginx:alpine

# Copiar el resultado de la compilación al directorio de archivos estáticos de Nginx
COPY --from=build /app/dist/proyect-pegasus/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]