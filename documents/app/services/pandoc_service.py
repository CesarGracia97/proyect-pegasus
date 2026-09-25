# app/services/pandoc_service.py
import asyncio
import os


async def convert_with_pandoc(input_path: str, target_ext: str) -> str:
    """Ejecuta la conversión mediante la herramienta CLI de Pandoc."""
    base_name = os.path.splitext(input_path)[0]
    output_path = f"{base_name}{target_ext}"

    cmd = ["pandoc", input_path, "-o", output_path]

    proc = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )
    stdout, stderr = await proc.communicate()

    if proc.returncode != 0:
        raise RuntimeError(f"Error en Pandoc: {stderr.decode('utf-8', errors='ignore')}")

    return output_path
