from copy import deepcopy

from app.database.mock_db import citas_db
from app.schemas.cita import Cita, CitaCreate, CitaUpdate


def obtener_todas_las_citas() -> list[Cita]:
    return [Cita(**cita) for cita in citas_db]


def obtener_cita_por_id(cita_id: int) -> Cita | None:
    for cita in citas_db:
        if cita["id"] == cita_id:
            return Cita(**cita)
    return None


def crear_cita(datos: CitaCreate) -> Cita:
    nueva_id = max((cita["id"] for cita in citas_db), default=0) + 1
    nueva_cita = {
        "id": nueva_id,
        **datos.model_dump(),
    }
    citas_db.append(nueva_cita)
    return Cita(**nueva_cita)


def actualizar_cita(cita_id: int, datos: CitaUpdate) -> Cita | None:
    for indice, cita in enumerate(citas_db):
        if cita["id"] == cita_id:
            datos_actualizados = cita.copy()
            cambios = datos.model_dump(exclude_unset=True)
            datos_actualizados.update(cambios)
            citas_db[indice] = datos_actualizados
            return Cita(**datos_actualizados)
    return None


def eliminar_cita(cita_id: int) -> bool:
    for indice, cita in enumerate(citas_db):
        if cita["id"] == cita_id:
            del citas_db[indice]
            return True
    return False
