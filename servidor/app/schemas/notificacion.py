from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


NotificationType = Literal["RECORDATORIO", "CONFIRMACION", "CANCELACION", "CAMBIO", "AVISO"]


class Notificacion(BaseModel):
    id: int = Field(..., ge=1)
    usuario_id: int = Field(..., ge=1)
    cita_id: int | None = Field(default=None, ge=1)
    titulo: str
    mensaje: str
    tipo: NotificationType
    leida: bool
    fecha_creacion: datetime