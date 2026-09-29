# Only module allowed to import the Hindsight client.
"""The ONLY module that talks to Hindsight: retain, recall, reflect."""

from typing import Any, Dict, List, Optional


class HindsightGateway:
    """Gateway for Hindsight memory operations."""

    async def retain(self, bank: str, text: str, tags: List[str]) -> Dict[str, Any]:
        """Retain narrative in Hindsight."""
        pass

    async def recall(self, bank: str, query: str, tags: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """Recall memories from Hindsight."""
        pass

    async def reflect(self, bank: str) -> Dict[str, Any]:
        """Trigger memory reflection in Hindsight."""
        pass
