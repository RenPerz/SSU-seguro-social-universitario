from typing import Literal

from pydantic import BaseModel, Field


class RecordatorioBase(BaseModel):
    id_cita: int = Field(..., ge=1)
    tiempo_recordatorio: Literal["24 H", "12 H", "1 H"] = "24 H"
    activo: bool = True


class RecordatorioCreate(RecordatorioBase):
    pass


class RecordatorioUpdate(BaseModel):
    id_cita: int | None = Field(default=None, ge=1)
    tiempo_recordatorio: Literal["24 H", "12 H", "1 H"] | None = None
    activo: bool | None = None


class Recordatorio(RecordatorioBase):
    id_recordatorio: int = Field(..., ge=1)

    model_config = {
        "from_attributes": True,
    }
