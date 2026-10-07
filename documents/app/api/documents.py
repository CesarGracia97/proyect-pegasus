import os
import traceback
from typing import Optional
from fastapi import APIRouter, File, Form, UploadFile, HTTPException, Query, BackgroundTasks
from fastapi.responses import FileResponse

from app.core.matrix import (
    CONVERSION_MATRIX,
    is_extension_allowed,
    get_allowed_targets,
    get_engine_for_conversion
)
from app.utils.file_manager import save_upload_file_tmp, cleanup_files
from app.services.libreoffice_service import convert_with_libreoffice
from app.services.pandoc_service import convert_with_pandoc
from app.services.pandas_service import convert_with_pandas
from app.services.weasyprint_service import convert_with_weasyprint

router = APIRouter()

@router.get("/allowed-conversions")
async def get_allowed_conversions(ext: str = Query(..., description="Extensión del archivo (ej: docx o .docx)")):
    """
    Paso 1 (Pre-flight): Consulta las extensiones de destino disponibles para el archivo seleccionado.
    """
    ext_clean = ext.lower().strip()
    if not ext_clean.startswith("."):
        ext_clean = f".{ext_clean}"

    if not is_extension_allowed(ext_clean):
        raise HTTPException(
            status_code=400,
            detail=f"La extensión '{ext}' no está en la lista blanca de archivos soportados."
        )

    return {
        "source_extension": ext_clean,
        "allowed_targets": get_allowed_targets(ext_clean),
        "engine": get_engine_for_conversion(ext_clean)
    }


@router.post("/convert")
async def convert_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    target_format: str = Form(..., description="Formato de destino (ej: pdf, docx, txt)")
):
    input_path = None
    output_path = None

    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No se adjuntó ningún archivo.")

        source_ext = os.path.splitext(file.filename)[1].lower()
        target_ext = target_format.lower().strip()
        if not target_ext.startswith("."):
            target_ext = f".{target_ext}"

        if not is_extension_allowed(source_ext):
            raise HTTPException(status_code=400, detail=f"Extensión de origen '{source_ext}' no permitida.")

        if target_ext not in get_allowed_targets(source_ext):
            raise HTTPException(status_code=400, detail=f"No se puede convertir de {source_ext} a {target_ext}.")

        input_path = await save_upload_file_tmp(file)
        engine = get_engine_for_conversion(source_ext)

        if engine == "libreoffice":
            output_path = await convert_with_libreoffice(input_path, target_ext)
        elif engine == "pandoc":
            output_path = await convert_with_pandoc(input_path, target_ext)
        elif engine == "pandas":
            output_path = await convert_with_pandas(input_path, target_ext)
        elif engine == "weasyprint":
            output_path = await convert_with_weasyprint(input_path, target_ext)
        else:
            raise RuntimeError(f"No hay un motor configurado para el tipo de archivo '{source_ext}'.")

        background_tasks.add_task(cleanup_files, input_path, output_path)
        download_name = f"{os.path.splitext(file.filename)[0]}{target_ext}"
        return FileResponse(path=output_path, filename=download_name, media_type="application/octet-stream")

    except HTTPException:
        cleanup_files(input_path, output_path)
        raise
    except Exception as e:
        cleanup_files(input_path, output_path)
        print("\n=== ERROR DETECTADO EN LA CONVERSIÓN ===")
        traceback.print_exc()
        print("=========================================\n")

        err_msg = str(e).strip() or "Error interno no especificado durante la conversión."
        raise HTTPException(status_code=500, detail=f"Falló el proceso de conversión: {err_msg}")