CONVERSION_MATRIX = {
    # Documentos
    ".docx": {"targets": [".pdf", ".md", ".txt", ".html", ".odt", ".epub"], "engine": "libreoffice"},
    ".md": {"targets": [".pdf", ".docx", ".html", ".txt", ".epub"], "engine": "pandoc"},
    ".odt": {"targets": [".pdf", ".docx", ".txt", ".md"], "engine": "pandoc"},
    ".txt": {"targets": [".pdf", ".docx", ".md", ".html"], "engine": "pandoc"},
    ".html": {"targets": [".pdf"], "engine": "weasyprint"},

    # Datos
    ".csv": {"targets": [".xlsx", ".json", ".sql"], "engine": "pandas"},
    ".xlsx": {"targets": [".csv", ".json", ".sql"], "engine": "pandas"},
    ".json": {"targets": [".csv", ".xlsx", ".sql"], "engine": "pandas"},
    ".sql": {"targets": [".csv", ".xlsx", ".json"], "engine": "pandas"}
}

def is_extension_allowed(extension: str) -> bool:
    ext = extension.lower() if extension.startswith(".") else f".{extension.lower()}"
    return ext in CONVERSION_MATRIX

def get_allowed_targets(extension: str) -> list:
    ext = extension.lower() if extension.startswith(".") else f".{extension.lower()}"
    return CONVERSION_MATRIX.get(ext, {}).get("targets", [])

def get_engine_for_conversion(extension: str) -> str:
    ext = extension.lower() if extension.startswith(".") else f".{extension.lower()}"
    return CONVERSION_MATRIX.get(ext, {}).get("engine", None)