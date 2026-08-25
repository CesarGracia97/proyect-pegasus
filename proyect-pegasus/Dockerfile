# Etapa 1: Compilación de Angular
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build -- --configuration production

# Etapa 2: Servir con Nginx
FROM nginx:alpine
COPY --from=build /app/dist/pegasus-frontend/browser /usr/share/nginx/html

# Copia tu configuración personalizada de Nginx si manejas rutas de Angular
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]