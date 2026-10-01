from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.auth import require_roles
from app.schemas.admin import (
    EstadoUpdate,
    EspecialidadCreate,
    EspecialidadUpdate,
    ProfesionalCreate,
    ProfesionalUpdate,
)
from app.services import admin_service

router = APIRouter(prefix="/api/admin", tags=["administracion"])
admin_required = Depends(require_roles("administrador"))


@router.get("/estadisticas", dependencies=[admin_required])
def estadisticas() -> dict:
    return admin_service.obtener_estadisticas()


@router.get("/usuarios", dependencies=[admin_required])
def usuarios(
    busqueda: str | None = None,
    rol: Literal["estudiante", "medico", "administrador"] | None = None,
    estado: Literal["ACTIVO", "INACTIVO"] | None = None,
) -> list[dict]:
    return admin_service.listar_usuarios(busqueda, rol, estado)


@router.patch("/usuarios/{usuario_id}/estado", dependencies=[admin_required])
def cambiar_estado_usuario(
    usuario_id: int,
    datos: EstadoUpdate,
    current_user: dict = Depends(require_roles("administrador")),
) -> dict[str, str]:
    if usuario_id == int(current_user["sub"]) and datos.estado == "INACTIVO":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="No puedes desactivar tu propia cuenta.")
    if not admin_service.actualizar_estado_usuario(usuario_id, datos.estado):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No se encontró el usuario.")
    return {"estado": datos.estado}


@router.get("/profesionales", dependencies=[admin_required])
def profesionales() -> list[dict]:
    return admin_service.listar_profesionales()


@router.post("/profesionales", status_code=status.HTTP_201_CREATED, dependencies=[admin_required])
def crear_profesional(datos: ProfesionalCreate) -> dict[str, int]:
    return {"id": admin_service.crear_profesional(datos.model_dump())}


@router.put("/profesionales/{profesional_id}", dependencies=[admin_required])
def editar_profesional(profesional_id: int, datos: ProfesionalUpdate) -> dict[str, str]:
    if not admin_service.actualizar_profesional(profesional_id, datos.model_dump()):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No se encontró el profesional.")
    return {"message": "Profesional actualizado."}


@router.patch("/profesionales/{profesional_id}/estado", dependencies=[admin_required])
def cambiar_estado_profesional(profesional_id: int, datos: EstadoUpdate) -> dict[str, str]:
    if not admin_service.actualizar_estado_profesional(profesional_id, datos.estado):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No se encontró el profesional.")
    return {"estado": datos.estado}


@router.get("/especialidades", dependencies=[admin_required])
def especialidades() -> list[dict]:
    return admin_service.listar_especialidades()


@router.post("/especialidades", status_code=status.HTTP_201_CREATED, dependencies=[admin_required])
def crear_especialidad(datos: EspecialidadCreate) -> dict[str, int]:
    return {"id": admin_service.crear_especialidad(datos.model_dump())}


@router.put("/especialidades/{especialidad_id}", dependencies=[admin_required])
def editar_especialidad(especialidad_id: int, datos: EspecialidadUpdate) -> dict[str, str]:
    if not admin_service.actualizar_especialidad(especialidad_id, datos.model_dump()):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No se encontró la especialidad.")
    return {"message": "Especialidad actualizada."}


@router.patch("/especialidades/{especialidad_id}/estado", dependencies=[admin_required])
def cambiar_estado_especialidad(especialidad_id: int, datos: EstadoUpdate) -> dict[str, str]:
    if not admin_service.actualizar_estado_especialidad(especialidad_id, datos.estado):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No se encontró la especialidad.")
    return {"estado": datos.estado}


@router.get("/citas", dependencies=[admin_required])
def citas(
    estado: Literal["PENDIENTE", "CONFIRMADA", "CANCELADA", "ATENDIDA", "NO_ASISTIO"] | None = None,
    fecha: date | None = None,
) -> list[dict]:
    return admin_service.listar_citas(estado, fecha)