from database import obtener_conexion


def listar_registros(fecha: str = None, tipo: str = None):
    conexion = obtener_conexion()
    cursor = conexion.cursor(dictionary=True)
    try:
        sql = """
            SELECT
                id_registro       AS id,
                paciente_nombre   AS paciente,
                paciente_ci       AS ci,
                tipo              AS tipo,
                motivo            AS motivo,
                medico_nombre     AS medico,
                TIME_FORMAT(hora_ingreso, '%%H:%%i') AS hora,
                estado            AS estado,
                prioridad         AS prioridad,
                fecha_ingreso     AS fecha
            FROM sobreturnos_emergencias
            WHERE 1=1
        """
        params = []
        if fecha:
            sql += " AND fecha_ingreso = %s"
            params.append(fecha)
        else:
            sql += " AND fecha_ingreso = CURDATE()"
        if tipo:
            sql += " AND tipo = %s"
            params.append(tipo)
        sql += " ORDER BY hora_ingreso DESC"

        cursor.execute(sql, tuple(params))
        return cursor.fetchall()
    finally:
        cursor.close()
        conexion.close()


def crear_registro(datos: dict):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    try:
        estado_inicial = "En atención" if datos["tipo"] == "emergencia" else "En espera"
        sql = """
            INSERT INTO sobreturnos_emergencias
                (paciente_nombre, paciente_ci, tipo, motivo,
                 medico_nombre, hora_ingreso, fecha_ingreso, estado)
            VALUES (%s, %s, %s, %s, %s, CURTIME(), CURDATE(), %s)
        """
        valores = (
            datos["paciente"],
            datos["ci"],
            datos["tipo"],
            datos["motivo"],
            datos.get("medico"),
            estado_inicial,
        )
        cursor.execute(sql, valores)
        conexion.commit()
        return cursor.lastrowid
    finally:
        cursor.close()
        conexion.close()


def actualizar_estado(id_registro: int, estado: str):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    try:
        sql = "UPDATE sobreturnos_emergencias SET estado = %s WHERE id_registro = %s"
        cursor.execute(sql, (estado, id_registro))
        conexion.commit()
        return cursor.rowcount
    finally:
        cursor.close()
        conexion.close()