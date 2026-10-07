import sys
import os
import asyncio

# Forzar a Python a reconocer el directorio raíz en el path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Configuración para Windows (ProactorEventLoop)
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importación correcta desde app/api/documents.py y app/api/data.py
from app.api.documents import router as documents_router
from app.api.data import router as data_router

app = FastAPI(
    title="Pegasus Documents & Data Converter API",
    version="2.0.0",
    docs_url="/docs"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]
)

# 1. Router para Conversión de Documentos (/documents)
app.include_router(documents_router, prefix="/documents")

# 2. Router para Conversión de Datos (/data)
app.include_router(data_router)

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "Pegasus Documents & Data Converter API"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)