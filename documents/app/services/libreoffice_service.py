import asyncio
import os
import shutil
import subprocess
import sys


def _get_soffice_path() -> str | None:
    """Busca el ejecutable de LibreOffice en el PATH o en las rutas predeterminadas de Windows."""
    in_path = shutil.which("soffice") or shutil.which("libreoffice")
    if in_path:
        return in_path

    if sys.platform == "win32":
        default_paths = [
            r"C:\Program Files\LibreOffice\program\soffice.exe",
            r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
        ]
        for path in default_paths:
            if os.path.exists(path):
                return path
    return None


def _run_soffice_sync(cmd: list) -> tuple[int, bytes, bytes]:
    result = subprocess.run(cmd, capture_output=True)
    return result.returncode, result.stdout, result.stderr


async def convert_with_libreoffice(input_path: str, target_ext: str) -> str:
    """Convierte documentos Office (.docx, .doc, .pptx) a PDF preservando el diseño 1:1."""
    soffice_bin = _get_soffice_path()
    if not soffice_bin:
        raise RuntimeError(
            "LibreOffice no está instalado en el sistema. Es necesario para convertir documentos .docx a PDF sin alterar el formato."
        )

    output_dir = os.path.dirname(input_path)
    base_name = os.path.splitext(os.path.basename(input_path))[0]
    target_clean = target_ext.lstrip(".").lower()
    expected_output = os.path.join(output_dir, f"{base_name}.{target_clean}")

    cmd = [
        soffice_bin,
        "--headless",
        "--convert-to", target_clean,
        input_path,
        "--outdir", output_dir
    ]

    returncode, stdout, stderr = await asyncio.to_thread(_run_soffice_sync, cmd)

    if returncode != 0 or not os.path.exists(expected_output):
        raw_err = stderr or stdout
        err_msg = raw_err.decode('utf-8', errors='ignore').strip() if raw_err else f"Código de salida {returncode}"
        raise RuntimeError(f"Falla en la conversión de LibreOffice: {err_msg}")

    return expected_output