import os
import sqlite3
import pandas as pd


async def convert_with_pandas(input_path: str, target_ext: str) -> str:
    """Procesa tablas y convierte bidireccionalmente entre CSV, XLSX, JSON y SQL."""
    base_name = os.path.splitext(input_path)[0]
    source_ext = os.path.splitext(input_path)[1].lower()
    output_path = f"{base_name}{target_ext}"

    # 1. Cargar datos según origen
    if source_ext == ".csv":
        df = pd.read_csv(input_path)
    elif source_ext in [".xlsx", ".xls"]:
        df = pd.read_excel(input_path)
    elif source_ext == ".json":
        df = pd.read_json(input_path)
    elif source_ext == ".sql":
        # Ejecutar script SQL en SQLite en memoria para extraer los registros
        conn = sqlite3.connect(":memory:")
        with open(input_path, "r", encoding="utf-8") as f:
            sql_script = f.read()
        conn.executescript(sql_script)

        # Obtener el nombre de la tabla creada
        tables_df = pd.read_sql_query("SELECT name FROM sqlite_master WHERE type='table';", conn)
        if tables_df.empty:
            conn.close()
            raise ValueError("El archivo .sql no contiene sentencias CREATE TABLE o INSERT válidas.")

        table_name = tables_df.iloc[0]['name']
        df = pd.read_sql_query(f"SELECT * FROM {table_name}", conn)
        conn.close()
    else:
        raise ValueError(f"Formato fuente no soportado por Pandas: {source_ext}")

    # 2. Exportar datos al destino
    target = target_ext.lower()
    if target == ".csv":
        df.to_csv(output_path, index=False)
    elif target == ".xlsx":
        df.to_excel(output_path, index=False)
    elif target == ".json":
        df.to_json(output_path, orient="records", indent=2)
    elif target == ".sql":
        # Convertir DataFrame a tabla SQLite y generar script DDL/DML (.sql)
        conn = sqlite3.connect(":memory:")
        table_name = "datos_exportados"
        df.to_sql(table_name, conn, index=False, if_exists="replace")

        with open(output_path, "w", encoding="utf-8") as f:
            for line in conn.iterdump():
                f.write(f"{line}\n")
        conn.close()
    else:
        raise ValueError(f"Formato de destino no soportado por Pandas: {target_ext}")

    return output_path