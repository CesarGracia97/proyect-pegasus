from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as api_router

app = FastAPI(
    title="Pegasus Document Converter API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar las rutas bajo el prefijo /documents
app.include_router(api_router, prefix="/documents")

@app.get("/")
async def root():
    return {"status": "online", "service": "Pegasus Document Converter"}