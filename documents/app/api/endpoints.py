# app/api/endpoints.py
import os
from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse

from app.core.matrix import get_allowed_targets, get_engine_for_conversion
from app.schemas.conversion import AllowedConversionsResponse
from app.utils.file_manager import save_upload_file_tmp, cleanup_files
from app.services.pandoc_service import convert_with_pandoc
from app.services.weasyprint_service import convert_with_weasyprint
from app.services.pandas_service import convert_with_pandas

router = APIRouter()

@router.get("/allowed-conversions", response_model=AllowedConversionsResponse)
async def allowed_conversions(
    ext: str = Query(..., description="Extensión del archivo de origen (ej. docx, csv)")
):
    targets = get_allowed_targets(ext)
    engine = get_engine_for_conversion(ext)

    if not targets:
        raise HTTPException(
            status_code=400,
            detail=f"La extensión '{ext}' no está registrada o no es soportada."
        )

    clean_ext = ext.lower() if ext.startswith(".") else f".{ext.lower()}"

    return AllowedConversionsResponse(
        source_extension=clean_ext,
        allowed_targets=targets,
        engine=engine
    )

@router.post("/convert")
async def convert_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    target_format: str = Form(..., description="Formato destino (ej. pdf, xlsx, json)")
):
    """
    Recibe un archivo y el formato destino deseado, ejecuta la conversión
    y retorna el documento resultante limpiando temporales en segundo plano.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="El archivo proporcionado no tiene un nombre válido.")

    source_ext = os.path.splitext(file.filename)[1].lower()
    target_ext = target_format.lower() if target_format.startswith(".") else f".{target_format.lower()}"

    # Validar que la conversión sea permitida
    allowed_targets = get_allowed_targets(source_ext)
    if target_ext not in allowed_targets:
        raise HTTPException(
            status_code=400,
            detail=f"La conversión desde '{source_ext}' hacia '{target_ext}' no está permitida."
        )

    engine = get_engine_for_conversion(source_ext)
    input_path = await save_upload_file_tmp(file)
    output_path = None

    try:
        # Enrutar al servicio correspondiente según la matriz
        if engine == "pandoc":
            output_path = await convert_with_pandoc(input_path, target_ext)
        elif engine == "weasyprint":
            output_path = await convert_with_weasyprint(input_path, target_ext)
        elif engine == "pandas":
            output_path = await convert_with_pandas(input_path, target_ext)
        else:
            raise HTTPException(status_code=500, detail=f"Motor de conversión '{engine}' no configurado.")

        # Programar la limpieza automática de los temporales post-envío
        background_tasks.add_task(cleanup_files, input_path, output_path)

        # Nombre para la descarga recibida por el cliente
        base_filename = os.path.splitext(file.filename)[0]
        output_filename = f"{base_filename}{target_ext}"

        return FileResponse(
            path=output_path,
            filename=output_filename,
            media_type="application/octet-stream"
        )

    except Exception as e:
        cleanup_files(input_path, output_path)
        raise HTTPException(status_code=500, detail=f"Falló el proceso de conversión: {str(e)}")