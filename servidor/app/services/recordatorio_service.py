from app.database.mock_db import citas_db, recordatorios_db
from app.database.connection import get_db_connection, get_db_status
from app.schemas.recordatorio import Recordatorio, RecordatorioCreate, RecordatorioUpdate


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
                SELECT r.id_recordatorio, r.id_cita, r.tiempo_recordatorio, r.activo
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
    return [Recordatorio(**registro) for registro in recordatorios_db if _belongs_to_user(registro, usuario_id)]


def obtener_recordatorio_por_id(recordatorio_id: int, usuario_id: int | None = None) -> Recordatorio | None:
    if get_db_status()["status"] == "ok":
        connection = get_db_connection()
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT r.id_recordatorio, r.id_cita, r.tiempo_recordatorio, r.activo
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
            return Recordatorio(**registro)
    return None


def crear_recordatorio(datos: RecordatorioCreate, usuario_id: int | None = None) -> Recordatorio | None:
    if get_db_status()["status"] == "ok":
        connection = get_db_connection()
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute(
                "SELECT id_cita FROM citas WHERE id_cita = %s AND (%s IS NULL OR id_usuario = %s)",
                (datos.id_cita, usuario_id, usuario_id),
            )
            if cursor.fetchone() is None:
                return None
            cursor.execute(
                """
                INSERT INTO recordatorios (id_cita, tiempo_recordatorio, activo)
                VALUES (%s, %s, %s)
                """,
                (datos.id_cita, datos.tiempo_recordatorio, datos.activo),
            )
            recordatorio_id = cursor.lastrowid
            cursor.execute(
                "SELECT id_recordatorio, id_cita, tiempo_recordatorio, activo FROM recordatorios WHERE id_recordatorio = %s",
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
    nuevo_registro = {
        "id_recordatorio": nuevo_id,
        **datos.model_dump(),
    }
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
                    SELECT r.id_recordatorio, r.id_cita, r.tiempo_recordatorio, r.activo
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

            fields = []
            values = []
            for field in ("id_cita", "tiempo_recordatorio", "activo"):
                if field in changes:
                    fields.append(f"{field} = %s")
                    values.append(changes[field])
            values.append(recordatorio_id)
            cursor.execute(
                f"UPDATE recordatorios SET {', '.join(fields)} WHERE id_recordatorio = %s",
                tuple(values),
            )
            cursor.execute(
                "SELECT id_recordatorio, id_cita, tiempo_recordatorio, activo FROM recordatorios WHERE id_recordatorio = %s",
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
            return Recordatorio(**datos_actualizados)
    return None
