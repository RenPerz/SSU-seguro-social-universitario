from app.database.mock_db import citas_db, recordatorios_db
from app.schemas.recordatorio import Recordatorio, RecordatorioCreate, RecordatorioUpdate


def _belongs_to_user(recordatorio: dict, usuario_id: int | None) -> bool:
    if usuario_id is None:
        return True
    cita = next((item for item in citas_db if item["id"] == recordatorio["id_cita"]), None)
    return cita is not None and cita["usuario_id"] == usuario_id


def obtener_todos_los_recordatorios(usuario_id: int | None = None) -> list[Recordatorio]:
    return [Recordatorio(**registro) for registro in recordatorios_db if _belongs_to_user(registro, usuario_id)]


def obtener_recordatorio_por_id(recordatorio_id: int, usuario_id: int | None = None) -> Recordatorio | None:
    for registro in recordatorios_db:
        if registro["id_recordatorio"] == recordatorio_id and _belongs_to_user(registro, usuario_id):
            return Recordatorio(**registro)
    return None


def crear_recordatorio(datos: RecordatorioCreate, usuario_id: int | None = None) -> Recordatorio | None:
    if usuario_id is not None:
        cita = next((item for item in citas_db if item["id"] == datos.id_cita), None)
        if cita is None or cita["usuario_id"] != usuario_id:
            return None
    nuevo_id = max((registro["id_recordatorio"] for registro in recordatorios_db), default=0) + 1
    nuevo_registro = {
        "id_recordatorio": nuevo_id,
        **datos.model_dump(),
    }
    recordatorios_db.append(nuevo_registro)
    return Recordatorio(**nuevo_registro)


def actualizar_recordatorio(recordatorio_id: int, datos: RecordatorioUpdate, usuario_id: int | None = None) -> Recordatorio | None:
    for indice, registro in enumerate(recordatorios_db):
        if registro["id_recordatorio"] == recordatorio_id and _belongs_to_user(registro, usuario_id):
            datos_actualizados = registro.copy()
            cambios = datos.model_dump(exclude_unset=True)
            datos_actualizados.update(cambios)
            recordatorios_db[indice] = datos_actualizados
            return Recordatorio(**datos_actualizados)
    return None
