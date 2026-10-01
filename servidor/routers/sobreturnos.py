from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from controllers import sobreturno_controller as ctrl

router = APIRouter(prefix="/api/sobreturnos", tags=["Sobreturnos y Emergencias"])


class NuevoIngreso(BaseModel):
    paciente: str
    ci: str
    tipo: str
    motivo: str
    medico: Optional[str] = None


class CambioEstado(BaseModel):
    estado: str


@router.get("")
def listar(
    fecha: Optional[str] = Query(None, description="YYYY-MM-DD"),
    tipo: Optional[str] = Query(None, description="sobreturno | emergencia"),
):
    try:
        return ctrl.listar_registros(fecha, tipo)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", status_code=201)
def crear(datos: NuevoIngreso):
    try:
        if datos.tipo not in ("sobreturno", "emergencia"):
            raise HTTPException(status_code=400, detail="tipo inválido")
        nuevo_id = ctrl.crear_registro(datos.dict())
        return {"id_registro": nuevo_id, "mensaje": "Ingreso registrado"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{id_registro}/estado")
def cambiar_estado(id_registro: int, body: CambioEstado):
    try:
        filas = ctrl.actualizar_estado(id_registro, body.estado)
        if filas == 0:
            raise HTTPException(status_code=404, detail="Registro no encontrado")
        return {"mensaje": "Estado actualizado"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))