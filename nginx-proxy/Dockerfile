FROM nginx:alpine

# Eliminar la configuración por defecto de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar nuestra configuración centralizada
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer el puerto donde escucha el Reverse Proxy
EXPOSE 8085

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]