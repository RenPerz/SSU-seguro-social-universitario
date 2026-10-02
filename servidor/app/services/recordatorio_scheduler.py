import asyncio
from datetime import datetime

from app.database.connection import get_db_connection, get_db_status
from app.database.mock_db import citas_db, recordatorios_db
from app.services.notificacion_service import crear_notificacion
from app.services.recordatorio_service import _scheduled_at


async def ejecutar_revision_recordatorios(intervalo: int = 60) -> None:
    while True:
        try:
            procesar_recordatorios_vencidos()
        except Exception:
            # La API debe seguir disponible aunque una revisión puntual falle.
            pass
        await asyncio.sleep(intervalo)


def procesar_recordatorios_vencidos(ahora: datetime | None = None) -> int:
    ahora = ahora or datetime.now()
    if get_db_status()["status"] == "ok":
        return _procesar_mysql(ahora)
    return _procesar_mock(ahora)


def _procesar_mock(ahora: datetime) -> int:
    generados = 0
    for registro in recordatorios_db:
        if registro.get("enviado") or not registro.get("activo"):
            continue
        cita = next((item for item in citas_db if item["id"] == registro["id_cita"]), None)
        if not cita or cita["estado"] in {"CANCELADA", "ATENDIDA", "NO_ASISTIO"}:
            continue
        fecha_programada = _scheduled_at(cita["fecha"], cita.get("hora"), registro["tiempo_recordatorio"])
        registro["fecha_programada"] = fecha_programada
        if fecha_programada <= ahora:
            crear_notificacion(
                usuario_id=cita["usuario_id"],
                titulo="Recordatorio de cita",
                mensaje=f"Tu cita de {cita['especialidad']} con {cita['profesional']} es el {cita['fecha']} a las {cita['hora'][:5]}.",
                tipo="RECORDATORIO",
                cita_id=cita["id"],
            )
            registro["enviado"] = True
            generados += 1
    return generados


def _procesar_mysql(ahora: datetime) -> int:
    connection = get_db_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT r.id_recordatorio, r.id_cita, c.id_usuario, c.fecha, c.hora,
                   c.estado, e.nombre AS especialidad,
                   CONCAT(p.nombres, ' ', p.apellidos) AS profesional,
                   r.tiempo_recordatorio
            FROM recordatorios r
            INNER JOIN citas c ON c.id_cita = r.id_cita
            INNER JOIN profesionales p ON p.id_profesional = c.id_profesional
            INNER JOIN especialidades e ON e.id_especialidad = p.id_especialidad
            WHERE r.activo = TRUE AND r.enviado = FALSE
            """
        )
        pendientes = cursor.fetchall()
        generados = 0
        for recordatorio in pendientes:
            if recordatorio["estado"] in {"CANCELADA", "ATENDIDA", "NO_ASISTIO"}:
                continue
            fecha_programada = _scheduled_at(
                recordatorio["fecha"],
                str(recordatorio["hora"]),
                recordatorio["tiempo_recordatorio"],
            )
            if fecha_programada > ahora:
                cursor.execute(
                    "UPDATE recordatorios SET fecha_programada = %s WHERE id_recordatorio = %s",
                    (fecha_programada, recordatorio["id_recordatorio"]),
                )
                continue
            cursor.execute(
                "UPDATE recordatorios SET enviado = TRUE, fecha_programada = %s WHERE id_recordatorio = %s AND enviado = FALSE",
                (fecha_programada, recordatorio["id_recordatorio"]),
            )
            if cursor.rowcount != 1:
                continue
            crear_notificacion(
                usuario_id=recordatorio["id_usuario"],
                titulo="Recordatorio de cita",
                mensaje=f"Tu cita de {recordatorio['especialidad']} con {recordatorio['profesional']} es el {recordatorio['fecha']} a las {str(recordatorio['hora'])[:5]}.",
                tipo="RECORDATORIO",
                cita_id=recordatorio["id_cita"],
            )
            generados += 1
        connection.commit()
        return generados
    finally:
        cursor.close()
        connection.close()
