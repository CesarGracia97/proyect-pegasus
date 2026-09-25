# app/core/matrix.py

CONVERSION_MATRIX = {
    # -------------------------------------------------------------
    # 1. Documentos de texto y marcado (Motor: Pandoc)
    # -------------------------------------------------------------
    ".docx": {
        "targets": [".pdf", ".md", ".txt", ".html", ".odt", ".epub"],
        "engine": "pandoc"
    },
    ".md": {
        "targets": [".pdf", ".docx", ".html", ".txt", ".epub"],
        "engine": "pandoc"
    },
    ".odt": {
        "targets": [".pdf", ".docx", ".txt", ".md"],
        "engine": "pandoc"
    },
    ".txt": {
        "targets": [".pdf", ".docx", ".md", ".html"],
        "engine": "pandoc"
    },

    # -------------------------------------------------------------
    # 2. Documentos visuales / HTML (Motor: WeasyPrint)
    # -------------------------------------------------------------
    ".html": {
        "targets": [".pdf"],
        "engine": "weasyprint"
    },

    # -------------------------------------------------------------
    # 3. Tablas y Estructuras de Datos (Motor: Pandas)
    # -------------------------------------------------------------
    ".csv": {
        "targets": [".xlsx", ".json"],
        "engine": "pandas"
    },
    ".xlsx": {
        "targets": [".csv", ".json"],
        "engine": "pandas"
    },
    ".json": {
        "targets": [".csv", ".xlsx"],
        "engine": "pandas"
    }
}

def get_allowed_targets(extension: str) -> list:
    """Devuelve la lista de formatos a los que se puede convertir una extensión."""
    ext = extension.lower() if extension.startswith(".") else f".{extension.lower()}"
    return CONVERSION_MATRIX.get(ext, {}).get("targets", [])

def get_engine_for_conversion(extension: str) -> str:
    """Devuelve el motor asignado para procesar la extensión de origen."""
    ext = extension.lower() if extension.startswith(".") else f".{extension.lower()}"
    return CONVERSION_MATRIX.get(ext, {}).get("engine", None)