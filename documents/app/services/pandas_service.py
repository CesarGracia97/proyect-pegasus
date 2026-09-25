# app/services/pandas_service.py
import os
import pandas as pd


async def convert_with_pandas(input_path: str, target_ext: str) -> str:
    """Procesa tablas y convierte bidireccionalmente entre CSV, XLSX y JSON."""
    base_name = os.path.splitext(input_path)[0]
    source_ext = os.path.splitext(input_path)[1].lower()
    output_path = f"{base_name}{target_ext}"

    # Carga de datos según la extensión de origen
    if source_ext == ".csv":
        df = pd.read_csv(input_path)
    elif source_ext in [".xlsx", ".xls"]:
        df = pd.read_excel(input_path)
    elif source_ext == ".json":
        df = pd.read_json(input_path)
    else:
        raise ValueError(f"Formato fuente no soportado por Pandas: {source_ext}")

    # Exportación al formato destino
    target = target_ext.lower()
    if target == ".csv":
        df.to_csv(output_path, index=False)
    elif target == ".xlsx":
        df.to_excel(output_path, index=False)
    elif target == ".json":
        df.to_json(output_path, orient="records", indent=2)
    else:
        raise ValueError(f"Formato de destino no soportado por Pandas: {target_ext}")

    return output_path