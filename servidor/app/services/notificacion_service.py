from datetime import datetime

from app.database.connection import get_db_connection, get_db_status
from app.database.mock_db import notificaciones_db
from app.schemas.notificacion import Notificacion, NotificationType


def obtener_notificaciones(usuario_id: int) -> list[Notificacion]:
    if get_db_status()["status"] == "ok":
        connection = get_db_connection()
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT id_notificacion AS id, usuario_id, cita_id, titulo, mensaje,
                    tipo, leida, fecha_creacion
                FROM notificaciones
                WHERE usuario_id = %s
                ORDER BY fecha_creacion DESC, id_notificacion DESC
                """,
                (usuario_id,),
            )
            return [Notificacion(**row) for row in cursor.fetchall()]
        finally:
            cursor.close()
            connection.close()

    return [
        Notificacion(**registro)
        for registro in sorted(
            (item for item in notificaciones_db if item["usuario_id"] == usuario_id),
            key=lambda item: (item["fecha_creacion"], item["id"]),
            reverse=True,
        )
    ]


def crear_notificacion(
    usuario_id: int,
    titulo: str,
    mensaje: str,
    tipo: NotificationType,
    cita_id: int | None = None,
) -> Notificacion:
    if get_db_status()["status"] == "ok":
        connection = get_db_connection()
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute(
                """
                INSERT INTO notificaciones (usuario_id, cita_id, titulo, mensaje, tipo)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (usuario_id, cita_id, titulo, mensaje, tipo),
            )
            notification_id = cursor.lastrowid
            cursor.execute(
                """
                SELECT id_notificacion AS id, usuario_id, cita_id, titulo, mensaje,
                    tipo, leida, fecha_creacion
                FROM notificaciones WHERE id_notificacion = %s
                """,
                (notification_id,),
            )
            return Notificacion(**cursor.fetchone())
        finally:
            cursor.close()
            connection.close()

    registro = {
        "id": max((item["id"] for item in notificaciones_db), default=0) + 1,
        "usuario_id": usuario_id,
        "cita_id": cita_id,
        "titulo": titulo,
        "mensaje": mensaje,
        "tipo": tipo,
        "leida": False,
        "fecha_creacion": datetime.now(),
    }
    notificaciones_db.append(registro)
    return Notificacion(**registro)


def marcar_notificacion_leida(notificacion_id: int, usuario_id: int) -> bool:
    if get_db_status()["status"] == "ok":
        connection = get_db_connection()
        try:
            cursor = connection.cursor()
            cursor.execute(
                "UPDATE notificaciones SET leida = TRUE WHERE id_notificacion = %s AND usuario_id = %s",
                (notificacion_id, usuario_id),
            )
            return cursor.rowcount > 0
        finally:
            cursor.close()
            connection.close()

    for registro in notificaciones_db:
        if registro["id"] == notificacion_id and registro["usuario_id"] == usuario_id:
            registro["leida"] = True
            return True
    return False


def marcar_todas_leidas(usuario_id: int) -> int:
    if get_db_status()["status"] == "ok":
        connection = get_db_connection()
        try:
            cursor = connection.cursor()
            cursor.execute(
                "UPDATE notificaciones SET leida = TRUE WHERE usuario_id = %s AND leida = FALSE",
                (usuario_id,),
            )
            return cursor.rowcount
        finally:
            cursor.close()
            connection.close()

    actualizadas = 0
    for registro in notificaciones_db:
        if registro["usuario_id"] == usuario_id and not registro["leida"]:
            registro["leida"] = True
            actualizadas += 1
    return actualizadas