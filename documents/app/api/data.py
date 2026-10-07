import os
from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse

from app.core.matrix import get_allowed_targets, is_extension_allowed
from app.utils.file_manager import save_upload_file_tmp, cleanup_files
from app.services.pandas_service import convert_with_pandas

router = APIRouter(prefix="/data", tags=["Data Converter"])


@router.get("/allowed-conversions")
async def allowed_data_conversions(
    ext: str = Query(..., description="Extensión del archivo de datos origen (ej. csv, xlsx, json)")
):
    """
    Consulta qué formatos de datos están disponibles para conversión según la lista blanca.
    """
    clean_ext = ext.lower() if ext.startswith(".") else f".{ext.lower()}"

    if not is_extension_allowed(clean_ext):
        raise HTTPException(
            status_code=400,
            detail=f"La extensión '{ext}' no está soportada o registrada en la lista blanca."
        )

    targets = get_allowed_targets(clean_ext)
    return {
        "source_extension": clean_ext,
        "allowed_targets": targets
    }


@router.post("/convert")
async def convert_data(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    target_format: str = Form(..., description="Formato de datos de destino (ej. xlsx, csv, json)")
):
    """
    Recibe un archivo estructurado (CSV, Excel, JSON), ejecuta la conversión
    a través del motor Pandas y devuelve el archivo resultante limpiando temporales.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="El archivo proporcionado no tiene un nombre válido.")

    source_ext = os.path.splitext(file.filename)[1].lower()
    target_ext = target_format.lower() if target_format.startswith(".") else f".{target_format.lower()}"

    # 1. Validar si la extensión de origen está en la whitelist
    if not is_extension_allowed(source_ext):
        raise HTTPException(
            status_code=400,
            detail=f"La extensión de origen '{source_ext}' no está soportada."
        )

    # 2. Validar si el formato destino está permitido
    allowed_targets = get_allowed_targets(source_ext)
    if target_ext not in allowed_targets:
        raise HTTPException(
            status_code=400,
            detail=f"La conversión desde '{source_ext}' hacia '{target_ext}' no está permitida."
        )

    # 3. Guardar archivo temporal en /temp
    input_path = await save_upload_file_tmp(file)
    output_path = None

    try:
        # 4. Procesar conversión con Pandas
        output_path = await convert_with_pandas(input_path, target_ext)

        # 5. Programar eliminación de temporales en segundo plano
        background_tasks.add_task(cleanup_files, input_path, output_path)

        # 6. Definir nombre final para la descarga del usuario
        base_filename = os.path.splitext(file.filename)[0]
        output_filename = f"{base_filename}{target_ext}"

        return FileResponse(
            path=output_path,
            filename=output_filename,
            media_type="application/octet-stream"
        )

    except Exception as e:
        cleanup_files(input_path, output_path)
        raise HTTPException(
            status_code=500,
            detail=f"Falló la conversión de datos: {str(e)}"
        )