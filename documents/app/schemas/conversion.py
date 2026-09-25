# app/schemas/conversion.py
from pydantic import BaseModel
from typing import List, Optional

class AllowedConversionsResponse(BaseModel):
    source_extension: str
    allowed_targets: List[str]
    engine: Optional[str] = None