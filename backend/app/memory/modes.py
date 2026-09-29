"""Memory mode: on | off | as_of."""

from enum import Enum


class MemoryMode(str, Enum):
    """Memory operation mode enum."""

    ON = "on"
    OFF = "off"
    AS_OF = "as_of"


def resolve_memory_mode(mode_str: str) -> MemoryMode:
    """Resolve input string to MemoryMode enum."""
    pass
