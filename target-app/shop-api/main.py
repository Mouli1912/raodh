"""Small FastAPI service with a DB and cache."""

from fastapi import FastAPI

app = FastAPI(title="Shop API Target Service")


@app.get("/checkout")
async def checkout() -> dict[str, str]:
    """Checkout endpoint stub."""
    return {"status": "ok"}
