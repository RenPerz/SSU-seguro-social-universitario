from datetime import date

from fastapi import HTTPException, status

from app.database.connection import get_db_connection, get_db_status


def _connection():
    if get_db_status()["status"] != "ok":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="La base de datos no está disponible.",
        )
    return get_db_connection()


def obtener_estadisticas() -> dict:
    connection = _connection()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT
                (SELECT COUNT(*) FROM usuarios) AS usuarios_registrados,
                (SELECT COUNT(*) FROM citas WHERE fecha = CURDATE()) AS citas_hoy,
                (SELECT COUNT(*) FROM citas WHERE estado IN ('PENDIENTE', 'CONFIRMADA')) AS citas_pendientes,
                (SELECT COUNT(*) FROM citas WHERE estado = 'CANCELADA') AS citas_canceladas,
                (SELECT COUNT(*) FROM profesionales WHERE estado = 'ACTIVO') AS profesionales_registrados,
                (SELECT COUNT(*) FROM especialidades WHERE estado = 'ACTIVO') AS especialidades_disponibles
            """
        )
        return cursor.fetchone()
    finally:
        cursor.close()
        connection.close()


def listar_usuarios(busqueda: str | None = None, rol: str | None = None, estado: str | None = None) -> list[dict]:
    connection = _connection()
    try:
        cursor = connection.cursor(dictionary=True)
        conditions = []
        values: list[str] = []
        if busqueda:
            conditions.append("(nombres LIKE %s OR apellidos LIKE %s OR ci LIKE %s OR email LIKE %s)")
            term = f"%{busqueda.strip()}%"
            values.extend([term] * 4)
        if rol:
            conditions.append("rol = %s")
            values.append(rol)
        if estado:
            conditions.append("estado = %s")
            values.append(estado)
        where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
        cursor.execute(
            f"""
            SELECT id_usuario AS id, nombres, apellidos, ci AS carnet, email, rol, estado
            FROM usuarios {where_clause} ORDER BY id_usuario DESC
            """,
            tuple(values),
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        connection.close()


def actualizar_estado_usuario(usuario_id: int, estado: str) -> bool:
    connection = _connection()
    try:
        cursor = connection.cursor()
        cursor.execute("UPDATE usuarios SET estado = %s WHERE id_usuario = %s", (estado, usuario_id))
        cursor.execute("SELECT id_usuario FROM usuarios WHERE id_usuario = %s", (usuario_id,))
        return cursor.fetchone() is not None
    finally:
        cursor.close()
        connection.close()


def listar_profesionales() -> list[dict]:
    connection = _connection()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT p.id_profesional AS id, p.nombres, p.apellidos, p.id_especialidad,
                p.matricula, p.estado, e.nombre AS especialidad
            FROM profesionales p
            INNER JOIN especialidades e ON e.id_especialidad = p.id_especialidad
            ORDER BY p.apellidos, p.nombres
            """
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        connection.close()


def _validar_especialidad(cursor, especialidad_id: int) -> None:
    cursor.execute(
        "SELECT id_especialidad FROM especialidades WHERE id_especialidad = %s AND estado = 'ACTIVO'",
        (especialidad_id,),
    )
    if cursor.fetchone() is None:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="La especialidad no está disponible.")


def crear_profesional(datos: dict) -> int:
    connection = _connection()
    try:
        cursor = connection.cursor()
        _validar_especialidad(cursor, datos["id_especialidad"])
        cursor.execute(
            """
            INSERT INTO profesionales (id_especialidad, nombres, apellidos, matricula, estado)
            VALUES (%s, %s, %s, %s, 'ACTIVO')
            """,
            (datos["id_especialidad"], datos["nombres"].strip(), datos["apellidos"].strip(), datos["matricula"]),
        )
        return cursor.lastrowid
    finally:
        cursor.close()
        connection.close()


def actualizar_profesional(profesional_id: int, datos: dict) -> bool:
    connection = _connection()
    try:
        cursor = connection.cursor()
        _validar_especialidad(cursor, datos["id_especialidad"])
        cursor.execute(
            """
            UPDATE profesionales SET nombres = %s, apellidos = %s,
                id_especialidad = %s, matricula = %s
            WHERE id_profesional = %s
            """,
            (datos["nombres"].strip(), datos["apellidos"].strip(), datos["id_especialidad"], datos["matricula"], profesional_id),
        )
        cursor.execute("SELECT id_profesional FROM profesionales WHERE id_profesional = %s", (profesional_id,))
        return cursor.fetchone() is not None
    finally:
        cursor.close()
        connection.close()


def actualizar_estado_profesional(profesional_id: int, estado: str) -> bool:
    connection = _connection()
    try:
        cursor = connection.cursor()
        cursor.execute("UPDATE profesionales SET estado = %s WHERE id_profesional = %s", (estado, profesional_id))
        cursor.execute("SELECT id_profesional FROM profesionales WHERE id_profesional = %s", (profesional_id,))
        return cursor.fetchone() is not None
    finally:
        cursor.close()
        connection.close()


def listar_especialidades() -> list[dict]:
    connection = _connection()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "SELECT id_especialidad AS id, nombre, descripcion, estado FROM especialidades ORDER BY nombre"
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        connection.close()


def crear_especialidad(datos: dict) -> int:
    connection = _connection()
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT id_especialidad FROM especialidades WHERE LOWER(nombre) = LOWER(%s)", (datos["nombre"].strip(),))
        if cursor.fetchone():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ya existe una especialidad con ese nombre.")
        cursor.execute(
            "INSERT INTO especialidades (nombre, descripcion, estado) VALUES (%s, %s, 'ACTIVO')",
            (datos["nombre"].strip(), datos["descripcion"]),
        )
        return cursor.lastrowid
    finally:
        cursor.close()
        connection.close()


def actualizar_especialidad(especialidad_id: int, datos: dict) -> bool:
    connection = _connection()
    try:
        cursor = connection.cursor()
        cursor.execute(
            "SELECT id_especialidad FROM especialidades WHERE LOWER(nombre) = LOWER(%s) AND id_especialidad <> %s",
            (datos["nombre"].strip(), especialidad_id),
        )
        if cursor.fetchone():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ya existe una especialidad con ese nombre.")
        cursor.execute(
            "UPDATE especialidades SET nombre = %s, descripcion = %s WHERE id_especialidad = %s",
            (datos["nombre"].strip(), datos["descripcion"], especialidad_id),
        )
        cursor.execute("SELECT id_especialidad FROM especialidades WHERE id_especialidad = %s", (especialidad_id,))
        return cursor.fetchone() is not None
    finally:
        cursor.close()
        connection.close()


def actualizar_estado_especialidad(especialidad_id: int, estado: str) -> bool:
    connection = _connection()
    try:
        cursor = connection.cursor()
        cursor.execute("UPDATE especialidades SET estado = %s WHERE id_especialidad = %s", (estado, especialidad_id))
        cursor.execute("SELECT id_especialidad FROM especialidades WHERE id_especialidad = %s", (especialidad_id,))
        return cursor.fetchone() is not None
    finally:
        cursor.close()
        connection.close()


def listar_citas(estado: str | None = None, fecha: date | None = None) -> list[dict]:
    connection = _connection()
    try:
        cursor = connection.cursor(dictionary=True)
        conditions = []
        values: list[object] = []
        if estado:
            conditions.append("c.estado = %s")
            values.append(estado)
        if fecha:
            conditions.append("c.fecha = %s")
            values.append(fecha)
        where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
        cursor.execute(
            f"""
            SELECT c.id_cita AS id, c.fecha, c.hora, c.estado, c.motivo,
                CONCAT(u.nombres, ' ', u.apellidos) AS paciente,
                u.ci AS carnet,
                CONCAT(p.nombres, ' ', p.apellidos) AS profesional,
                e.nombre AS especialidad
            FROM citas c
            INNER JOIN usuarios u ON u.id_usuario = c.id_usuario
            INNER JOIN profesionales p ON p.id_profesional = c.id_profesional
            INNER JOIN especialidades e ON e.id_especialidad = p.id_especialidad
            {where_clause}
            ORDER BY c.fecha DESC, c.hora DESC
            """,
            tuple(values),
        )
        return cursor.fetchall()
    finally:
        cursor.close()
        connection.close()