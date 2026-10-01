from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import get_db_status
from app.routes.citas import router as citas_router
from app.routes.db import router as db_router

app = FastAPI(
    title="Seguro Social Universitario API",
    version="0.1.0",
    description="API inicial para la gestión de citas y recordatorios del sistema SSU.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(citas_router)
app.include_router(db_router)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "API del Seguro Social Universitario funcionando"}


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/status")
def status() -> dict[str, str]:
    db_status = get_db_status()
    return {
        "status": "active",
        "framework": "FastAPI",
        "database": db_status,
    }
