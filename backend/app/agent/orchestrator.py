"""Recall -> LLM -> validate -> rank pipeline."""

from typing import Any, Dict, List


class AgentOrchestrator:
    """Orchestrate triage pipeline steps."""

    async def run_triage(self, incident_id: str, memory_mode: str = "on") -> Dict[str, Any]:
        """Execute full triage pipeline."""
        pass
