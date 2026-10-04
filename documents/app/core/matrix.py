# Lista blanca de extensiones soportadas y sus destinos permitidos
CONVERSION_MATRIX = {
    ".docx": {
        "targets": [".pdf", ".md", ".txt", ".html", ".odt", ".epub"],
        "engine": "libreoffice"
    },
    ".md": {
        "targets": [".pdf", ".docx", ".html", ".txt", ".epub"],
        "engine": "libreoffice"
    },
    ".odt": {
        "targets": [".pdf", ".docx", ".txt", ".md"],
        "engine": "libreoffice"
    },
    ".txt": {
        "targets": [".pdf", ".docx", ".md", ".html"],
        "engine": "libreoffice"
    },
    ".html": {
        "targets": [".pdf"],
        "engine": "weasyprint"
    },
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

def is_extension_allowed(ext: str) -> bool:
    """Verifica si la extensión está en la lista blanca."""
    ext_clean = ext.lower() if ext.startswith(".") else f".{ext.lower()}"
    return ext_clean in CONVERSION_MATRIX

def get_allowed_targets(ext: str) -> list:
    """Devuelve la lista de formatos a los que se puede convertir."""
    ext_clean = ext.lower() if ext.startswith(".") else f".{ext.lower()}"
    return CONVERSION_MATRIX.get(ext_clean, {}).get("targets", [])

def get_engine_for_conversion(ext: str) -> str:
    """Devuelve el motor asignado para la conversión."""
    ext_clean = ext.lower() if ext.startswith(".") else f".{ext.lower()}"
    return CONVERSION_MATRIX.get(ext_clean, {}).get("engine", None)