from fastapi import APIRouter, HTTPException, status

from app.schemas.recordatorio import Recordatorio, RecordatorioCreate, RecordatorioUpdate
from app.services.recordatorio_service import (
    actualizar_recordatorio,
    crear_recordatorio,
    obtener_recordatorio_por_id,
    obtener_todos_los_recordatorios,
)

router = APIRouter(prefix="/api", tags=["recordatorios"])


@router.get("/recordatorios", response_model=list[Recordatorio])
def listar_recordatorios() -> list[Recordatorio]:
    return obtener_todos_los_recordatorios()


@router.post("/recordatorios", response_model=Recordatorio, status_code=status.HTTP_201_CREATED)
def registrar_recordatorio(datos: RecordatorioCreate) -> Recordatorio:
    return crear_recordatorio(datos)


@router.put("/recordatorios/{recordatorio_id}", response_model=Recordatorio)
def actualizar_recordatorio_endpoint(recordatorio_id: int, datos: RecordatorioUpdate) -> Recordatorio:
    recordatorio = actualizar_recordatorio(recordatorio_id, datos)
    if recordatorio is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró el recordatorio con ID {recordatorio_id}.",
        )
    return recordatorio


@router.get("/recordatorios/{recordatorio_id}", response_model=Recordatorio)
def obtener_recordatorio(recordatorio_id: int) -> Recordatorio:
    recordatorio = obtener_recordatorio_por_id(recordatorio_id)
    if recordatorio is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró el recordatorio con ID {recordatorio_id}.",
        )
    return recordatorio
