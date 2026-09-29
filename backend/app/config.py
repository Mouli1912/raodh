"""Settings loaded from environment."""

from pydantic import BaseSettings


class Settings(BaseSettings):
    """Application settings configuration."""

    hindsight_base_url: str = "http://localhost:8000"
    hindsight_api_key: str = ""
    groq_api_key: str = ""
    llm_primary: str = "llama-3.3-70b-versatile"
    llm_fallback: str = "llama-3.1-8b-instant"
    database_url: str = "postgresql://precedent:precedent@localhost:5432/precedent_db"
    redis_url: str = "redis://localhost:6379/0"
    webhook_secret: str = ""

    class Config:
        env_file = ".env"


def get_settings() -> Settings:
    """Return loaded settings instance."""
    pass
