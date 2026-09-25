FROM python:3.11-slim

# Evitar que Python genere archivos .pyc en disco y forzar logs inmediatos
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Instalar dependencias del sistema necesarias para Pandoc y WeasyPrint
RUN apt-get update && apt-get install -y --no-install-recommends \
    pandoc \
    weasyprint \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar el archivo de requerimientos e instalar dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código de la aplicación
COPY . .

# Exponer el puerto del microservicio
EXPOSE 8000

# Comando para iniciar la API con Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]