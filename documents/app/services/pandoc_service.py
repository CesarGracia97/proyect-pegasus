import asyncio
import os
import shutil
import subprocess
import sys


def _get_wkhtmltopdf_path() -> str | None:
    """Busca wkhtmltopdf en el PATH o en la ruta de instalación por defecto de Windows."""
    in_path = shutil.which("wkhtmltopdf")
    if in_path:
        return in_path

    if sys.platform == "win32":
        default_paths = [
            r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe",
            r"C:\Program Files (x86)\wkhtmltopdf\bin\wkhtmltopdf.exe",
        ]
        for path in default_paths:
            if os.path.exists(path):
                return path
    return None


def _run_command_sync(cmd: list) -> tuple[int, bytes, bytes]:
    """Ejecuta el subproceso síncrono en un proceso secundario."""
    result = subprocess.run(cmd, capture_output=True)
    return result.returncode, result.stdout, result.stderr


async def convert_with_pandoc(input_path: str, target_ext: str) -> str:
    if not shutil.which("pandoc"):
        raise RuntimeError("El ejecutable 'pandoc' no está instalado o no se encuentra en el PATH del sistema.")

    base_name = os.path.splitext(input_path)[0]
    output_path = f"{base_name}{target_ext}"

    cmd = ["pandoc", input_path, "-o", output_path, "--standalone"]

    if target_ext.lower() == ".pdf":
        wkhtml_bin = _get_wkhtmltopdf_path()
        if wkhtml_bin:
            cmd.extend([f"--pdf-engine={wkhtml_bin}"])
        elif shutil.which("weasyprint"):
            cmd.extend(["--pdf-engine=weasyprint"])
        else:
            raise RuntimeError("No se encontró ningún motor de PDF ('wkhtmltopdf' o 'weasyprint') en el sistema.")

    # Ejecutar en un hilo para no bloquear el bucle de eventos y evitar el NotImplementedError
    returncode, stdout, stderr = await asyncio.to_thread(_run_command_sync, cmd)

    if returncode != 0:
        raw_err = stderr or stdout
        err_msg = ""
        if raw_err:
            for encoding in ['utf-8', 'cp1252', 'latin-1']:
                try:
                    decoded = raw_err.decode(encoding).strip()
                    if decoded:
                        err_msg = decoded
                        break
                except UnicodeDecodeError:
                    continue

        if not err_msg:
            err_msg = f"Pandoc falló con código de salida {returncode}."

        raise RuntimeError(err_msg)

    return output_path