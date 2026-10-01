from fastapi import APIRouter, HTTPException, status

from app.schemas.cita import Cita, CitaCreate, CitaUpdate
from app.services.cita_service import (
    crear_cita,
    eliminar_cita,
    obtener_cita_por_id,
    obtener_todas_las_citas,
    actualizar_cita,
)

router = APIRouter(prefix="/api", tags=["citas"])


@router.get("/citas", response_model=list[Cita])
def listar_citas() -> list[Cita]:
    return obtener_todas_las_citas()


@router.get("/citas/{cita_id}", response_model=Cita)
def obtener_cita(cita_id: int) -> Cita:
    cita = obtener_cita_por_id(cita_id)
    if cita is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró la cita con ID {cita_id}.",
        )
    return cita


@router.post("/citas", response_model=Cita, status_code=status.HTTP_201_CREATED)
def registrar_cita(cita: CitaCreate) -> Cita:
    return crear_cita(cita)


@router.put("/citas/{cita_id}", response_model=Cita)
def actualizar_cita_endpoint(cita_id: int, cita: CitaUpdate) -> Cita:
    cita_actualizada = actualizar_cita(cita_id, cita)
    if cita_actualizada is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró la cita con ID {cita_id}.",
        )
    return cita_actualizada


@router.delete("/citas/{cita_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_cita_endpoint(cita_id: int) -> None:
    eliminado = eliminar_cita(cita_id)
    if not eliminado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró la cita con ID {cita_id}.",
        )
