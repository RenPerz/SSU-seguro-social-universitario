from app.database.mock_db import recordatorios_db
from app.schemas.recordatorio import Recordatorio, RecordatorioCreate, RecordatorioUpdate


def obtener_todos_los_recordatorios() -> list[Recordatorio]:
    return [Recordatorio(**registro) for registro in recordatorios_db]


def obtener_recordatorio_por_id(recordatorio_id: int) -> Recordatorio | None:
    for registro in recordatorios_db:
        if registro["id_recordatorio"] == recordatorio_id:
            return Recordatorio(**registro)
    return None


def crear_recordatorio(datos: RecordatorioCreate) -> Recordatorio:
    nuevo_id = max((registro["id_recordatorio"] for registro in recordatorios_db), default=0) + 1
    nuevo_registro = {
        "id_recordatorio": nuevo_id,
        **datos.model_dump(),
    }
    recordatorios_db.append(nuevo_registro)
    return Recordatorio(**nuevo_registro)


def actualizar_recordatorio(recordatorio_id: int, datos: RecordatorioUpdate) -> Recordatorio | None:
    for indice, registro in enumerate(recordatorios_db):
        if registro["id_recordatorio"] == recordatorio_id:
            datos_actualizados = registro.copy()
            cambios = datos.model_dump(exclude_unset=True)
            datos_actualizados.update(cambios)
            recordatorios_db[indice] = datos_actualizados
            return Recordatorio(**datos_actualizados)
    return None
