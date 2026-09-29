"""Engine and session factory."""

from typing import Generator
from sqlalchemy.orm import Session


def get_db_session() -> Generator[Session, None, None]:
    """Provide database session generator."""
    pass
