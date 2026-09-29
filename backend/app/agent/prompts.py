"""System prompt and prompt builders."""

from typing import Any, Dict, List


def build_system_prompt() -> str:
    """Build agent system prompt."""
    pass


def build_triage_prompt(alert_data: Dict[str, Any], memories: List[Dict[str, Any]]) -> str:
    """Build triage prompt with context and memories."""
    pass
