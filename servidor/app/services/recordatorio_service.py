from datetime import datetime, timedelta

from app.database.mock_db import citas_db, recordatorios_db
from app.database.connection import get_db_connection, get_db_status
from app.schemas.recordatorio import Recordatorio, RecordatorioCreate, RecordatorioUpdate


REMINDER_HOURS = {"24 H": 24, "12 H": 12, "1 H": 1}


def _scheduled_at(fecha: str | datetime, hora: str | None, tiempo: str) -> datetime:
    if isinstance(fecha, datetime):
        appointment_at = fecha
    else:
        appointment_at = datetime.fromisoformat(f"{fecha}T{hora or '00:00:00'}")
    return appointment_at - timedelta(hours=REMINDER_HOURS[tiempo])


def _recordatorio_data(registro: dict, cita: dict | None = None) -> dict:
    result = registro.copy()
    if cita and result.get("fecha_programada") is None:
        result["fecha_programada"] = _scheduled_at(cita["fecha"], cita.get("hora"), result["tiempo_recordatorio"])
    return result


def _belongs_to_user(recordatorio: dict, usuario_id: int | None) -> bool:
    if usuario_id is None:
        return True
    cita = next((item for item in citas_db if item["id"] == recordatorio["id_cita"]), None)
    return cita is not None and cita["usuario_id"] == usuario_id


def obtener_todos_los_recordatorios(usuario_id: int | None = None) -> list[Recordatorio]:
    if get_db_status()["status"] == "ok":
        connection = get_db_connection()
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT r.id_recordatorio, r.id_cita, r.tiempo_recordatorio, r.activo, r.fecha_programada, r.enviado
                FROM recordatorios r
                INNER JOIN citas c ON c.id_cita = r.id_cita
                WHERE (%s IS NULL OR c.id_usuario = %s)
                ORDER BY r.id_recordatorio
                """,
                (usuario_id, usuario_id),
            )
            return [Recordatorio(**row) for row in cursor.fetchall()]
        finally:
            cursor.close()
            connection.close()
    return [Recordatorio(**_recordatorio_data(registro, next((c for c in citas_db if c["id"] == registro["id_cita"]), None))) for registro in recordatorios_db if _belongs_to_user(registro, usuario_id)]


def obtener_recordatorio_por_id(recordatorio_id: int, usuario_id: int | None = None) -> Recordatorio | None:
    if get_db_status()["status"] == "ok":
        connection = get_db_connection()
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT r.id_recordatorio, r.id_cita, r.tiempo_recordatorio, r.activo, r.fecha_programada, r.enviado
                FROM recordatorios r
                INNER JOIN citas c ON c.id_cita = r.id_cita
                WHERE r.id_recordatorio = %s AND (%s IS NULL OR c.id_usuario = %s)
                """,
                (recordatorio_id, usuario_id, usuario_id),
            )
            row = cursor.fetchone()
            return Recordatorio(**row) if row else None
        finally:
            cursor.close()
            connection.close()
    for registro in recordatorios_db:
        if registro["id_recordatorio"] == recordatorio_id and _belongs_to_user(registro, usuario_id):
            cita = next((item for item in citas_db if item["id"] == registro["id_cita"]), None)
            return Recordatorio(**_recordatorio_data(registro, cita))
    return None

def crear_recordatorio(datos: RecordatorioCreate, usuario_id: int | None = None) -> Recordatorio | None:
    if get_db_status()["status"] == "ok":
        connection = get_db_connection()
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute(
                "SELECT id_cita, fecha, hora FROM citas WHERE id_cita = %s AND (%s IS NULL OR id_usuario = %s)",
                (datos.id_cita, usuario_id, usuario_id),
            )
            cita = cursor.fetchone()
            if cita is None:
                return None
            fecha_programada = _scheduled_at(cita["fecha"], str(cita["hora"]), datos.tiempo_recordatorio)
            cursor.execute(
                """
                INSERT INTO recordatorios (id_cita, tiempo_recordatorio, activo, fecha_programada, enviado)
                VALUES (%s, %s, %s, %s, FALSE)
                """,
                (datos.id_cita, datos.tiempo_recordatorio, datos.activo, fecha_programada),
            )
            recordatorio_id = cursor.lastrowid
            cursor.execute(
                "SELECT id_recordatorio, id_cita, tiempo_recordatorio, activo, fecha_programada, enviado FROM recordatorios WHERE id_recordatorio = %s",
                (recordatorio_id,),
            )
            return Recordatorio(**cursor.fetchone())
        finally:
            cursor.close()
            connection.close()

    if usuario_id is not None:
        cita = next((item for item in citas_db if item["id"] == datos.id_cita), None)
        if cita is None or cita["usuario_id"] != usuario_id:
            return None
    nuevo_id = max((registro["id_recordatorio"] for registro in recordatorios_db), default=0) + 1
    cita = next((item for item in citas_db if item["id"] == datos.id_cita), None)
    nuevo_registro = {
        "id_recordatorio": nuevo_id,
        **datos.model_dump(),
    }
    nuevo_registro["fecha_programada"] = _scheduled_at(cita["fecha"], cita.get("hora"), datos.tiempo_recordatorio) if cita else None
    nuevo_registro["enviado"] = False
    recordatorios_db.append(nuevo_registro)
    return Recordatorio(**nuevo_registro)


def actualizar_recordatorio(recordatorio_id: int, datos: RecordatorioUpdate, usuario_id: int | None = None) -> Recordatorio | None:
    if get_db_status()["status"] == "ok":
        connection = get_db_connection()
        try:
            cursor = connection.cursor(dictionary=True)
            changes = datos.model_dump(exclude_unset=True)
            if changes.get("id_cita") is None:
                changes.pop("id_cita", None)
            if not changes:
                cursor.execute(
                    """
                    SELECT r.id_recordatorio, r.id_cita, r.tiempo_recordatorio, r.activo, r.fecha_programada, r.enviado
                    FROM recordatorios r INNER JOIN citas c ON c.id_cita = r.id_cita
                    WHERE r.id_recordatorio = %s AND (%s IS NULL OR c.id_usuario = %s)
                    """,
                    (recordatorio_id, usuario_id, usuario_id),
                )
                row = cursor.fetchone()
                return Recordatorio(**row) if row else None

            cursor.execute(
                """
                SELECT r.id_recordatorio FROM recordatorios r
                INNER JOIN citas c ON c.id_cita = r.id_cita
                WHERE r.id_recordatorio = %s AND (%s IS NULL OR c.id_usuario = %s)
                """,
                (recordatorio_id, usuario_id, usuario_id),
            )
            if cursor.fetchone() is None:
                return None
            if "id_cita" in changes:
                cursor.execute(
                    "SELECT id_cita FROM citas WHERE id_cita = %s AND (%s IS NULL OR id_usuario = %s)",
                    (changes["id_cita"], usuario_id, usuario_id),
                )
                if cursor.fetchone() is None:
                    return None

            target_cita = changes.get("id_cita")
            if target_cita is None:
                cursor.execute("SELECT id_cita FROM recordatorios WHERE id_recordatorio = %s", (recordatorio_id,))
                target_cita = cursor.fetchone()["id_cita"]
            cursor.execute("SELECT fecha, hora FROM citas WHERE id_cita = %s", (target_cita,))
            cita_row = cursor.fetchone()
            fecha_programada = _scheduled_at(cita_row["fecha"], str(cita_row["hora"]), changes.get("tiempo_recordatorio", "24 H"))

            fields = []
            values = []
            for field in ("id_cita", "tiempo_recordatorio", "activo"):
                if field in changes:
                    fields.append(f"{field} = %s")
                    values.append(changes[field])
                    fields.extend(["fecha_programada = %s", "enviado = FALSE"])
                    values.append(fecha_programada)
            values.append(recordatorio_id)
            cursor.execute(
                f"UPDATE recordatorios SET {', '.join(fields)} WHERE id_recordatorio = %s",
                tuple(values),
            )
            cursor.execute(
                "SELECT id_recordatorio, id_cita, tiempo_recordatorio, activo, fecha_programada, enviado FROM recordatorios WHERE id_recordatorio = %s",
                (recordatorio_id,),
            )
            row = cursor.fetchone()
            return Recordatorio(**row) if row else None
        finally:
            cursor.close()
            connection.close()

    for indice, registro in enumerate(recordatorios_db):
        if registro["id_recordatorio"] == recordatorio_id and _belongs_to_user(registro, usuario_id):
            datos_actualizados = registro.copy()
            cambios = datos.model_dump(exclude_unset=True)
            if "id_cita" in cambios:
                cita_destino = next((cita for cita in citas_db if cita["id"] == cambios["id_cita"]), None)
                if cita_destino is None or (usuario_id is not None and cita_destino["usuario_id"] != usuario_id):
                    return None
            datos_actualizados.update(cambios)
            recordatorios_db[indice] = datos_actualizados
            datos_actualizados["enviado"] = False
            cita = next((item for item in citas_db if item["id"] == datos_actualizados["id_cita"]), None)
            datos_actualizados["fecha_programada"] = _scheduled_at(cita["fecha"], cita.get("hora"), datos_actualizados["tiempo_recordatorio"]) if cita else None
            recordatorios_db[indice] = datos_actualizados
            return Recordatorio(**datos_actualizados)
    return None

