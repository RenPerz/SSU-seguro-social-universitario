from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_user
from app.schemas.cita import Cita, CitaCreate, CitaUpdate
from app.services.cita_service import (
    crear_cita,
    eliminar_cita,
    obtener_cita_por_id,
    obtener_todas_las_citas,
    actualizar_cita,
    obtener_historial,
)
from app.services.notificacion_service import crear_notificacion

router = APIRouter(prefix="/api", tags=["citas"])


@router.get("/citas/historial", response_model=list[Cita])
def listar_historial(current_user: dict = Depends(get_current_user)) -> list[Cita]:
    return obtener_historial(int(current_user["sub"]))


@router.get("/citas", response_model=list[Cita])
def listar_citas(current_user: dict = Depends(get_current_user)) -> list[Cita]:
    return obtener_todas_las_citas(int(current_user["sub"]))


@router.get("/citas/{cita_id}", response_model=Cita)
def obtener_cita(cita_id: int, current_user: dict = Depends(get_current_user)) -> Cita:
    cita = obtener_cita_por_id(cita_id, int(current_user["sub"]))
    if cita is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró la cita con ID {cita_id}.",
        )
    return cita


@router.post("/citas", response_model=Cita, status_code=status.HTTP_201_CREATED)
def registrar_cita(cita: CitaCreate, current_user: dict = Depends(get_current_user)) -> Cita:
    usuario_id = int(current_user["sub"])
    nueva_cita = crear_cita(cita.model_copy(update={"usuario_id": usuario_id}))
    crear_notificacion(
        usuario_id,
        "Solicitud de cita registrada",
        f"Tu solicitud de {nueva_cita.especialidad} para el {nueva_cita.fecha} a las {nueva_cita.hora} fue registrada.",
        "AVISO",
        nueva_cita.id,
    )
    return nueva_cita


@router.put("/citas/{cita_id}", response_model=Cita)
def actualizar_cita_endpoint(cita_id: int, cita: CitaUpdate, current_user: dict = Depends(get_current_user)) -> Cita:
    usuario_id = int(current_user["sub"])
    cita_anterior = obtener_cita_por_id(cita_id, usuario_id)
    cita_actualizada = actualizar_cita(cita_id, cita, usuario_id)
    if cita_actualizada is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró la cita con ID {cita_id}.",
        )
    if cita_anterior is not None:
        if cita_anterior.estado != cita_actualizada.estado:
            if cita_actualizada.estado == "CANCELADA":
                crear_notificacion(
                    usuario_id,
                    "Cita cancelada",
                    f"Tu cita de {cita_actualizada.especialidad} del {cita_actualizada.fecha} fue cancelada.",
                    "CANCELACION",
                    cita_id,
                )
            elif cita_actualizada.estado == "CONFIRMADA":
                crear_notificacion(
                    usuario_id,
                    "Cita confirmada",
                    f"Tu cita de {cita_actualizada.especialidad} para el {cita_actualizada.fecha} fue confirmada.",
                    "CONFIRMACION",
                    cita_id,
                )
        if (cita_anterior.fecha, cita_anterior.hora) != (cita_actualizada.fecha, cita_actualizada.hora):
            crear_notificacion(
                usuario_id,
                "Horario de cita actualizado",
                f"Tu cita de {cita_actualizada.especialidad} ahora es el {cita_actualizada.fecha} a las {cita_actualizada.hora}.",
                "CAMBIO",
                cita_id,
            )
    return cita_actualizada


@router.delete("/citas/{cita_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_cita_endpoint(cita_id: int, current_user: dict = Depends(get_current_user)) -> None:
    eliminado = eliminar_cita(cita_id, int(current_user["sub"]))
    if not eliminado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró la cita con ID {cita_id}.",
        )
