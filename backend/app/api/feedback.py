"""POST /v1/suggestions/{id}/feedback endpoint."""

from typing import Any, Dict
from fastapi import APIRouter

router = APIRouter(prefix="/v1/suggestions", tags=["feedback"])


@router.post("/{suggestion_id}/feedback")
async def record_feedback(suggestion_id: str, feedback_data: Dict[str, Any]) -> Dict[str, Any]:
    """Record operator feedback for suggestion."""
    pass
