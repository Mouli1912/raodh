"""POST /v1/alerts endpoint."""

from typing import Any, Dict
from fastapi import APIRouter

router = APIRouter(prefix="/v1", tags=["alerts"])


@router.post("/alerts")
async def receive_alert(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Receive incoming alert payload."""
    pass
