"""GET incident, POST triage?memory=on|off, POST resolve endpoints."""

from typing import Any, Dict
from fastapi import APIRouter

router = APIRouter(prefix="/v1/incidents", tags=["incidents"])


@router.get("/{incident_id}")
async def get_incident(incident_id: str) -> Dict[str, Any]:
    """Fetch incident by ID."""
    pass


@router.post("/{incident_id}/triage")
async def triage_incident(incident_id: str, memory: str = "on") -> Dict[str, Any]:
    """Perform triage on incident with memory toggle."""
    pass


@router.post("/{incident_id}/resolve")
async def resolve_incident(incident_id: str, resolution_data: Dict[str, Any]) -> Dict[str, Any]:
    """Mark incident as resolved."""
    pass
