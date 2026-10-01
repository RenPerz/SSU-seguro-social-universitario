from database import obtener_conexion


def listar_resultados(q: str = ""):
    conexion = obtener_conexion()
    cursor = conexion.cursor(dictionary=True)
    try:
        sql = """
            SELECT
                rl.id_resultado      AS id,
                CONCAT(p.nombres, ' ', p.apellidos) AS paciente,
                p.ci                 AS ci,
                rl.examen_nombre     AS examen,
                rl.fecha_solicitud   AS fecha,
                rl.estado            AS estado,
                COALESCE(rl.resultado, '-') AS resultado
            FROM resultados_laboratorio rl
            JOIN pacientes p ON p.id_paciente = rl.id_paciente
            WHERE p.nombres         LIKE %s
               OR p.apellidos       LIKE %s
               OR p.ci              LIKE %s
               OR rl.examen_nombre  LIKE %s
            ORDER BY rl.fecha_solicitud DESC, rl.id_resultado DESC
        """
        termino = f"%{q}%"
        cursor.execute(sql, (termino, termino, termino, termino))
        return cursor.fetchall()
    finally:
        cursor.close()
        conexion.close()


def obtener_resultado(id_resultado: int):
    conexion = obtener_conexion()
    cursor = conexion.cursor(dictionary=True)
    try:
        sql = """
            SELECT
                rl.id_resultado      AS id,
                CONCAT(p.nombres, ' ', p.apellidos) AS paciente,
                p.ci                 AS ci,
                rl.examen_nombre     AS examen,
                rl.fecha_solicitud   AS fecha,
                rl.estado            AS estado,
                COALESCE(rl.resultado, '-') AS resultado,
                rl.valores_referencia,
                rl.observaciones
            FROM resultados_laboratorio rl
            JOIN pacientes p ON p.id_paciente = rl.id_paciente
            WHERE rl.id_resultado = %s
        """
        cursor.execute(sql, (id_resultado,))
        return cursor.fetchone()
    finally:
        cursor.close()
        conexion.close()


def crear_resultado(datos: dict):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    try:
        sql = """
            INSERT INTO resultados_laboratorio
                (id_paciente, examen_nombre, id_doctor_solicita,
                 fecha_solicitud, fecha_resultado, estado, resultado)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        estado = datos.get("estado", "pendiente")
        fecha_resultado = datos.get("fecha_resultado") if estado == "listo" else None
        valores = (
            datos["id_paciente"],
            datos["examen_nombre"],
            datos.get("id_doctor_solicita"),
            datos["fecha_solicitud"],
            fecha_resultado,
            estado,
            datos.get("resultado"),
        )
        cursor.execute(sql, valores)
        conexion.commit()
        return cursor.lastrowid
    finally:
        cursor.close()
        conexion.close()


def actualizar_estado(id_resultado: int, estado: str, resultado: str = None):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    try:
        if estado == "listo" and resultado is not None:
            sql = """
                UPDATE resultados_laboratorio
                SET estado = %s, resultado = %s, fecha_resultado = CURDATE()
                WHERE id_resultado = %s
            """
            cursor.execute(sql, (estado, resultado, id_resultado))
        else:
            sql = "UPDATE resultados_laboratorio SET estado = %s WHERE id_resultado = %s"
            cursor.execute(sql, (estado, id_resultado))
        conexion.commit()
        return cursor.rowcount
    finally:
        cursor.close()
        conexion.close()