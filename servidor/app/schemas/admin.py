from typing import Literal

from pydantic import BaseModel, Field


EstadoUsuario = Literal["ACTIVO", "INACTIVO"]
RolUsuario = Literal["estudiante", "medico", "administrador"]


class EstadoUpdate(BaseModel):
    estado: EstadoUsuario


class ProfesionalCreate(BaseModel):
    nombres: str = Field(..., min_length=2, max_length=100)
    apellidos: str = Field(..., min_length=2, max_length=100)
    id_especialidad: int = Field(..., ge=1)
    matricula: str | None = Field(default=None, max_length=50)


class ProfesionalUpdate(ProfesionalCreate):
    pass


class EspecialidadCreate(BaseModel):
    nombre: str = Field(..., min_length=3, max_length=100)
    descripcion: str | None = Field(default=None, max_length=255)


class EspecialidadUpdate(EspecialidadCreate):
    pass