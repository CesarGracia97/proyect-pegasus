# Etapa 1: Compilación de Angular
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build -- --configuration production

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Si usas Angular 17+ (con la subcarpeta browser):
COPY --from=build /app/dist/proyect-pegasus/browser /usr/share/nginx/html

# Nota: Si tu compilación de Angular NO genera la carpeta '/browser', usa únicamente:
# COPY --from=build /app/dist/proyect-pegasus /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]