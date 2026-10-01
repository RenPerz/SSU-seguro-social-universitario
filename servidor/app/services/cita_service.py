from app.database.connection import get_db_connection, get_db_status
from app.database.mock_db import citas_db
from app.schemas.cita import Cita, CitaCreate, CitaUpdate


def _obtener_citas_mysql(usuario_id: int | None = None) -> list[Cita] | None:
    db_status = get_db_status()
    if db_status["status"] != "ok":
        return None

    connection = get_db_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        query = """
            SELECT
                c.id_cita AS id,
                c.id_usuario AS usuario_id,
                e.nombre AS especialidad,
                CONCAT(p.nombres, ' ', p.apellidos) AS profesional,
                c.fecha,
                c.hora,
                c.motivo,
                c.estado,
                c.lugar
            FROM citas c
            INNER JOIN profesionales p ON p.id_profesional = c.id_profesional
            INNER JOIN especialidades e ON e.id_especialidad = p.id_especialidad
            WHERE (%s IS NULL OR c.id_usuario = %s)
            ORDER BY c.fecha, c.hora
            """
        cursor.execute(query, (usuario_id, usuario_id))
        rows = cursor.fetchall()
        return [Cita(**row) for row in rows]
    finally:
        cursor.close()
        connection.close()


def obtener_todas_las_citas(usuario_id: int | None = None) -> list[Cita]:
    citas_mysql = _obtener_citas_mysql(usuario_id)
    if citas_mysql is not None:
        return citas_mysql
    return [Cita(**cita) for cita in citas_db if usuario_id is None or cita["usuario_id"] == usuario_id]


def obtener_cita_por_id(cita_id: int, usuario_id: int | None = None) -> Cita | None:
    citas_mysql = _obtener_citas_mysql(usuario_id)
    if citas_mysql is not None:
        for cita in citas_mysql:
            if cita.id == cita_id:
                return cita
        return None

    for cita in citas_db:
        if cita["id"] == cita_id and (usuario_id is None or cita["usuario_id"] == usuario_id):
            return Cita(**cita)
    return None


def crear_cita(datos: CitaCreate) -> Cita:
    db_status = get_db_status()
    if db_status["status"] == "ok":
        connection = get_db_connection()
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute(
                "SELECT id_profesional FROM profesionales ORDER BY id_profesional LIMIT 1"
            )
            profesional = cursor.fetchone()
            profesional_id = (profesional or {}).get("id_profesional", 1)
            cursor.execute(
                """
                INSERT INTO citas (id_usuario, id_profesional, fecha, hora, motivo, estado, lugar)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    datos.usuario_id,
                    profesional_id,
                    datos.fecha,
                    datos.hora,
                    datos.motivo,
                    datos.estado,
                    datos.lugar,
                ),
            )
            nueva_id = cursor.lastrowid
            cursor.execute(
                "SELECT id_cita AS id, id_usuario AS usuario_id, %s AS especialidad, %s AS profesional, fecha, hora, motivo, estado, lugar FROM citas WHERE id_cita = %s",
                ("Medicina General", "Profesional asignado", nueva_id),
            )
            row = cursor.fetchone()
            return Cita(**row)
        finally:
            cursor.close()
            connection.close()

    nueva_id = max((cita["id"] for cita in citas_db), default=0) + 1
    nueva_cita = {
        "id": nueva_id,
        **datos.model_dump(),
    }
    citas_db.append(nueva_cita)
    return Cita(**nueva_cita)


def actualizar_cita(cita_id: int, datos: CitaUpdate, usuario_id: int | None = None) -> Cita | None:
    db_status = get_db_status()
    if db_status["status"] == "ok":
        connection = get_db_connection()
        try:
            cursor = connection.cursor(dictionary=True)
            cambios = datos.model_dump(exclude_unset=True)
            cambios.pop("usuario_id", None)
            if not cambios:
                return obtener_cita_por_id(cita_id, usuario_id)

            campos = []
            valores = []
            for clave, valor in cambios.items():
                campos.append(f"{clave} = %s")
                valores.append(valor)
            valores.extend([cita_id, usuario_id])
            cursor.execute(f"UPDATE citas SET {', '.join(campos)} WHERE id_cita = %s AND id_usuario = %s", tuple(valores))
            cursor.execute(
                """
                SELECT
                    c.id_cita AS id,
                    c.id_usuario AS usuario_id,
                    e.nombre AS especialidad,
                    CONCAT(p.nombres, ' ', p.apellidos) AS profesional,
                    c.fecha,
                    c.hora,
                    c.motivo,
                    c.estado,
                    c.lugar
                FROM citas c
                INNER JOIN profesionales p ON p.id_profesional = c.id_profesional
                INNER JOIN especialidades e ON e.id_especialidad = p.id_especialidad
                WHERE c.id_cita = %s
                """,
                (cita_id,),
            )
            row = cursor.fetchone()
            if row is None:
                return None
            return Cita(**row)
        finally:
            cursor.close()
            connection.close()

    for indice, cita in enumerate(citas_db):
        if cita["id"] == cita_id and (usuario_id is None or cita["usuario_id"] == usuario_id):
            datos_actualizados = cita.copy()
            cambios = datos.model_dump(exclude_unset=True)
            datos_actualizados.update(cambios)
            citas_db[indice] = datos_actualizados
            return Cita(**datos_actualizados)
    return None


def eliminar_cita(cita_id: int, usuario_id: int | None = None) -> bool:
    db_status = get_db_status()
    if db_status["status"] == "ok":
        connection = get_db_connection()
        try:
            cursor = connection.cursor()
            cursor.execute("DELETE FROM citas WHERE id_cita = %s AND id_usuario = %s", (cita_id, usuario_id))
            return cursor.rowcount > 0
        finally:
            cursor.close()
            connection.close()

    for indice, cita in enumerate(citas_db):
        if cita["id"] == cita_id and (usuario_id is None or cita["usuario_id"] == usuario_id):
            del citas_db[indice]
            return True
    return False
