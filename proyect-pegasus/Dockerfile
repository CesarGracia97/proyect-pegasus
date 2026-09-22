# ETAPA 1: COMPILACIÓN 

FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production  # Convierte el código TypeScript en HTML/JS

# ETAPA 2: SERVIDOR (Usa Nginx)

FROM nginx:alpine
# Copia configuración interna de Angular
COPY nginx.conf /etc/nginx/conf.d/default.conf 

# Copia archivos estáticos compilados en la Etapa 1 hacia el servidor Nginx
COPY --from=build /app/dist/proyect-pegasus/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]