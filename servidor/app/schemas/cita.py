from datetime import date, time
from typing import Literal

from pydantic import BaseModel, Field


class CitaBase(BaseModel):
    usuario_id: int = Field(..., ge=1)
    especialidad: str = Field(..., min_length=3, max_length=100)
    profesional: str = Field(..., min_length=3, max_length=120)
    fecha: date
    hora: time
    motivo: str = Field(..., min_length=5, max_length=300)
    estado: Literal["PENDIENTE", "CONFIRMADA", "CANCELADA", "ATENDIDA", "NO_ASISTIO"] = "PENDIENTE"
    lugar: str = Field(default="Seguro Social Universitario", min_length=3, max_length=200)


class CitaCreate(CitaBase):
    usuario_id: int | None = Field(default=None, ge=1)


class CitaUpdate(BaseModel):
    usuario_id: int | None = Field(default=None, ge=1)
    especialidad: str | None = Field(default=None, min_length=3, max_length=100)
    profesional: str | None = Field(default=None, min_length=3, max_length=120)
    fecha: date | None = None
    hora: time | None = None
    motivo: str | None = Field(default=None, min_length=5, max_length=300)
    estado: Literal["PENDIENTE", "CONFIRMADA", "CANCELADA"] | None = None
    lugar: str | None = Field(default=None, min_length=3, max_length=200)


class Cita(CitaBase):
    id: int = Field(..., ge=1)

    model_config = {
        "from_attributes": True,
    }
