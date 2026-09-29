"""Pydantic models: Hypothesis, Evidence, TriageResult."""

from typing import List, Dict, Any
from pydantic import BaseModel


class Evidence(BaseModel):
    """Evidence supporting a hypothesis."""

    source: str
    content: str
    relevance_score: float


class Hypothesis(BaseModel):
    """Hypothesis model for incident root cause."""

    id: str
    title: str
    description: str
    confidence: float
    evidence: List[Evidence]
    recommended_actions: List[str]


class TriageResult(BaseModel):
    """Complete triage result model."""

    incident_id: str
    hypotheses: List[Hypothesis]
    avoid_list: List[str]
    memories_used: List[Dict[str, Any]]
