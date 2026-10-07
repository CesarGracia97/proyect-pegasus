import pandas as pd
import io
from fastapi import HTTPException
from fastapi.responses import StreamingResponse

def convert_data_file(file_bytes: bytes, source_ext: str, target_ext: str) -> StreamingResponse:
    source_ext = source_ext.lower().strip('.')
    target_ext = target_ext.lower().strip('.')
    buffer_in = io.BytesIO(file_bytes)
    
    # 1. Cargar archivo de origen a DataFrame
    try:
        if source_ext == 'csv':
            df = pd.read_csv(buffer_in)
        elif source_ext in ['xlsx', 'xls']:
            df = pd.read_excel(buffer_in)
        elif source_ext == 'json':
            df = pd.read_json(buffer_in)
        else:
            raise HTTPException(status_code=400, detail=f"Formato de origen no soportado: {source_ext}")
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Error al procesar el archivo de entrada: {str(e)}")

    # 2. Exportar DataFrame al formato de destino
    buffer_out = io.BytesIO()
    
    if target_ext == 'csv':
        df.to_csv(buffer_out, index=False)
        media_type = 'text/csv'
    elif target_ext == 'xlsx':
        with pd.ExcelWriter(buffer_out, engine='openpyxl') as writer:
            df.to_excel(writer, index=False)
        media_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    elif target_ext == 'json':
        df.to_json(buffer_out, orient='records', indent=2)
        media_type = 'application/json'
    elif target_ext == 'html':
        df.to_html(buffer_out, index=False)
        media_type = 'text/html'
    else:
        raise HTTPException(status_code=400, detail=f"Formato de destino no soportado: {target_ext}")

    buffer_out.seek(0)
    
    return StreamingResponse(
        buffer_out,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename=converted.{target_ext}"}
    )
    