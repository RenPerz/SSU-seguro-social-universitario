from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from controllers import laboratorio_controller as ctrl

router = APIRouter(prefix="/api/laboratorios", tags=["Laboratorios"])


class NuevoResultado(BaseModel):
    id_paciente: int
    examen_nombre: str
    id_doctor_solicita: Optional[int] = None
    fecha_solicitud: str
    estado: str = "pendiente"
    resultado: Optional[str] = None


class CambioEstado(BaseModel):
    estado: str
    resultado: Optional[str] = None


@router.get("")
def listar(q: str = Query("", description="Buscar por paciente, CI o examen")):
    try:
        return ctrl.listar_resultados(q)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{id_resultado}")
def obtener(id_resultado: int):
    try:
        r = ctrl.obtener_resultado(id_resultado)
        if not r:
            raise HTTPException(status_code=404, detail="Resultado no encontrado")
        return r
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", status_code=201)
def crear(datos: NuevoResultado):
    try:
        nuevo_id = ctrl.crear_resultado(datos.dict())
        return {"id_resultado": nuevo_id, "mensaje": "Resultado creado"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{id_resultado}/estado")
def cambiar_estado(id_resultado: int, body: CambioEstado):
    try:
        filas = ctrl.actualizar_estado(id_resultado, body.estado, body.resultado)
        if filas == 0:
            raise HTTPException(status_code=404, detail="Resultado no encontrado")
        return {"mensaje": "Estado actualizado"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))