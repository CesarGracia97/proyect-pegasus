# app/services/weasyprint_service.py
import os


async def convert_with_weasyprint(input_path: str, target_ext: str) -> str:
    """Convierte un documento HTML a PDF utilizando la librería WeasyPrint."""
    if target_ext.lower() != ".pdf":
        raise ValueError("WeasyPrint únicamente soporta conversiones a formato .pdf")

    try:
        from weasyprint import HTML
    except OSError as e:
        raise RuntimeError(
            "WeasyPrint requiere librerías binarias (GObject/Pango) que no están instaladas en Windows local. "
            "Esta conversión funcionará correctamente cuando el microservicio se ejecute dentro de Docker."
        ) from e

    base_name = os.path.splitext(input_path)[0]
    output_path = f"{base_name}.pdf"

    HTML(filename=input_path).write_pdf(output_path)
    return output_path