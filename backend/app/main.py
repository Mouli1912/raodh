"""FastAPI app, router registration, health endpoint."""

from fastapi import FastAPI

app = FastAPI(title="Precedent Incident Response API")


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Health endpoint returning operational status."""
    return {"status": "ok"}
