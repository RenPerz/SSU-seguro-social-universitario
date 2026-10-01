from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_user
from app.schemas.notificacion import Notificacion
from app.services.notificacion_service import (
    marcar_notificacion_leida,
    marcar_todas_leidas,
    obtener_notificaciones,
)

router = APIRouter(prefix="/api/notificaciones", tags=["notificaciones"])


@router.get("", response_model=list[Notificacion])
def listar_notificaciones(current_user: dict = Depends(get_current_user)) -> list[Notificacion]:
    return obtener_notificaciones(int(current_user["sub"]))


@router.patch("/leidas")
def marcar_todas_como_leidas(current_user: dict = Depends(get_current_user)) -> dict[str, int]:
    actualizadas = marcar_todas_leidas(int(current_user["sub"]))
    return {"actualizadas": actualizadas}


@router.patch("/{notificacion_id}/leida", status_code=status.HTTP_204_NO_CONTENT)
def marcar_como_leida(
    notificacion_id: int,
    current_user: dict = Depends(get_current_user),
) -> None:
    actualizada = marcar_notificacion_leida(notificacion_id, int(current_user["sub"]))
    if not actualizada:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No se encontró la notificación.")