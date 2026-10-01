from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_user
from app.schemas.recordatorio import Recordatorio, RecordatorioCreate, RecordatorioUpdate
from app.services.recordatorio_service import (
    actualizar_recordatorio,
    crear_recordatorio,
    obtener_recordatorio_por_id,
    obtener_todos_los_recordatorios,
)

router = APIRouter(prefix="/api", tags=["recordatorios"])


@router.get("/recordatorios", response_model=list[Recordatorio])
def listar_recordatorios(current_user: dict = Depends(get_current_user)) -> list[Recordatorio]:
    return obtener_todos_los_recordatorios(int(current_user["sub"]))


@router.post("/recordatorios", response_model=Recordatorio, status_code=status.HTTP_201_CREATED)
def registrar_recordatorio(datos: RecordatorioCreate, current_user: dict = Depends(get_current_user)) -> Recordatorio:
    recordatorio = crear_recordatorio(datos, int(current_user["sub"]))
    if recordatorio is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La cita no pertenece al usuario autenticado.")
    return recordatorio


@router.put("/recordatorios/{recordatorio_id}", response_model=Recordatorio)
def actualizar_recordatorio_endpoint(recordatorio_id: int, datos: RecordatorioUpdate, current_user: dict = Depends(get_current_user)) -> Recordatorio:
    recordatorio = actualizar_recordatorio(recordatorio_id, datos, int(current_user["sub"]))
    if recordatorio is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró el recordatorio con ID {recordatorio_id}.",
        )
    return recordatorio


@router.get("/recordatorios/{recordatorio_id}", response_model=Recordatorio)
def obtener_recordatorio(recordatorio_id: int, current_user: dict = Depends(get_current_user)) -> Recordatorio:
    recordatorio = obtener_recordatorio_por_id(recordatorio_id, int(current_user["sub"]))
    if recordatorio is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró el recordatorio con ID {recordatorio_id}.",
        )
    return recordatorio
