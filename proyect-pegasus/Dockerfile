FROM nginx:alpine

# Copiar la configuración personalizada de Nginx para Angular
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos estáticos precompilados por GitHub Actions
COPY dist/proyect-pegasus/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]