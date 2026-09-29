"""Groq client with retry and fallback model."""

from typing import Optional


class LLMClient:
    """Groq client supporting primary and fallback LLM models."""

    async def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Generate response from Groq API with retries and fallback."""
        pass
