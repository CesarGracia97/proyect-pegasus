import os
import uuid
import shutil
from fastapi import UploadFile

TEMP_DIR = os.path.join(os.getcwd(), "temp")
os.makedirs(TEMP_DIR, exist_ok=True)


async def save_upload_file_tmp(upload_file: UploadFile) -> str:
    """Guarda el archivo subido en el disco temporal con un nombre único."""
    ext = os.path.splitext(upload_file.filename)[1].lower() if upload_file.filename else ""
    unique_name = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(TEMP_DIR, unique_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    return file_path


def cleanup_files(*file_paths: str):
    """Elimina los archivos temporales creados durante la conversión."""
    for path in file_paths:
        if path and os.path.exists(path):
            try:
                os.remove(path)
            except Exception as e:
                print(f"Error al eliminar el archivo temporal '{path}': {e}")