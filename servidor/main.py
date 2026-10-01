from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from database import obtener_conexion
from routers import laboratorios, sobreturnos

app = FastAPI(title="API SSU Cochabamba")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(laboratorios.router)
app.include_router(sobreturnos.router)


@app.get("/")
def raiz():
    return {"mensaje": "Servidor backend de SSU en Python funcionando correctamente"}


@app.get("/api/estado")
def verificar_estado():
    return {"estado": "activo", "lenguaje": "Python", "framework": "FastAPI"}


@app.get("/api/test-db")
def probar_db():
    try:
        conexion = obtener_conexion()
        if conexion.is_connected():
            conexion.close()
            return {"status": "ok", "mensaje": "Conexión exitosa a MySQL"}
    except Exception as e:
        return {"status": "error", "detalle": str(e)}


@app.get("/api/medicamentos/buscar")
def buscar_medicamentos(q: str = Query("", description="Nombre o componente a buscar")):
    conexion = obtener_conexion()
    cursor = conexion.cursor(dictionary=True)
    try:
        sql = """
            SELECT id_medicamento, nombre_generico, nombre_comercial,
                   concentracion, presentacion, stock, disponibilidad,
                   descripcion_tratamiento
            FROM medicamentos
            WHERE nombre_generico LIKE %s OR nombre_comercial LIKE %s
            ORDER BY nombre_generico ASC
        """
        termino = f"%{q}%"
        cursor.execute(sql, (termino, termino))
        return cursor.fetchall()
    except Exception as e:
        return {"error": str(e)}
    finally:
        cursor.close()
        conexion.close()

from pydantic import BaseModel

class CitaCreate(BaseModel):
    id_paciente: int
    id_doctor: int
    id_horario: int
    motivo: str

#  Obtener lista de doctores con su especialidad
@app.get("/api/doctores")
def listar_doctores():
    conexion = obtener_conexion()
    cursor = conexion.cursor(dictionary=True)
    try:
        sql = """
            SELECT 
                d.id_doctor,
                CONCAT(d.nombres, ' ', d.apellidos) AS nombre_completo,
                e.nombre AS especialidad
            FROM doctores d
            LEFT JOIN especialidades e ON d.id_especialidad = e.id_especialidad
            ORDER BY d.apellidos ASC
        """
        cursor.execute(sql)
        return cursor.fetchall()
    except Exception as e:
        return {"error": str(e)}
    finally:
        cursor.close()
        conexion.close()

#  Obtener horarios disponibles de un doctor
@app.get("/api/doctores/{id_doctor}/horarios")
def obtener_horarios_doctor(id_doctor: int):
    conexion = obtener_conexion()
    cursor = conexion.cursor(dictionary=True)
    try:
        # Quitamos el "AND cupos_disponibles > 0" para que devuelva TODOS los turnos
        sql = """
            SELECT id_horario, fecha, hora_inicio, hora_fin, consultorio, cupos_disponibles 
            FROM horarios_medicos 
            WHERE id_doctor = %s
        """
        cursor.execute(sql, (id_doctor,))
        horarios = cursor.fetchall()
        return horarios
    except Exception as e:
        return {"error": str(e)}
    finally:
        cursor.close()
        conexion.close()

#  Registrar cita y descontar cupo automáticamente
@app.post("/api/citas-con-horario")
def crear_cita_con_horario(datos: CitaCreate):
    conexion = obtener_conexion()
    cursor = conexion.cursor(dictionary=True)
    try:
        # Verificar cupos disponibles
        cursor.execute("SELECT fecha, hora_inicio, cupos_disponibles FROM horarios_medicos WHERE id_horario = %s", (datos.id_horario,))
        horario = cursor.fetchone()

        if not horario or horario['cupos_disponibles'] <= 0:
            return {"error": "Lo sentimos, este horario ya no cuenta con cupos disponibles."}

        fecha_hora = f"{horario['fecha']} {horario['hora_inicio']}"

        # Insertar la cita
        # Insertar la cita
        sql_cita = """
            INSERT INTO citas (id_paciente, id_doctor, fecha_hora, motivo, estado)
            VALUES (%s, %s, %s, %s, 'pendiente')
        """
        cursor.execute(sql_cita, (datos.id_paciente, datos.id_doctor, fecha_hora, datos.motivo))

        # Obtener de forma segura el ID real generado por MySQL
        cursor.execute("SELECT LAST_INSERT_ID() AS id")
        resultado_id = cursor.fetchone()
        nuevo_id = resultado_id['id'] if resultado_id else 0

        # Descontar cupo
        sql_horario = "UPDATE horarios_medicos SET cupos_disponibles = cupos_disponibles - 1 WHERE id_horario = %s"
        cursor.execute(sql_horario, (datos.id_horario,))

        conexion.commit()

        return {"mensaje": "¡Ficha médica reservada exitosamente!", "id_cita": nuevo_id}
    except Exception as e:
        conexion.rollback()
        return {"error": str(e)}
    finally:
        conexion.commit()
        cursor.close()
        conexion.close()


from pydantic import BaseModel

class DatosEspera(BaseModel):
    id_paciente: int
    id_doctor: int
    id_horario: int
    motivo: str

@app.post("/api/lista-espera")
def unirse_lista_espera(datos: DatosEspera):
    conexion = obtener_conexion()
    cursor = conexion.cursor(dictionary=True)
    try:
        sql = """
            INSERT INTO lista_espera (id_paciente, id_doctor, id_horario, motivo, estado)
            VALUES (%s, %s, %s, %s, 'esperando')
        """
        cursor.execute(sql, (datos.id_paciente, datos.id_doctor, datos.id_horario, datos.motivo))
        conexion.commit()
        return {"mensaje": "Te has unido a la lista de espera exitosamente. Te avisaremos si se libera un cupo."}
    except Exception as e:
        return {"error": str(e)}
    finally:
        cursor.close()
        conexion.close()

@app.put("/api/citas/{id_cita}/cancelar")
def cancelar_cita(id_cita: int):
    conexion = obtener_conexion()
    cursor = conexion.cursor(dictionary=True)
    try:
        # 1. Obtener los datos de la cita a cancelar (para saber su id_doctor e id_horario)
        cursor.execute("SELECT id_doctor, fecha_hora FROM citas WHERE id_cita = %s", (id_cita,))
        cita = cursor.fetchone()
        
        if not cita:
            return {"error": "Cita no encontrada"}

        # 2. Marcar la cita como cancelada
        cursor.execute("UPDATE citas SET estado = 'cancelada' WHERE id_cita = %s", (id_cita,))

        # 3. Buscar si hay alguien en la lista de espera para este doctor y fecha/horario
        # (Asumiendo que relacionas el horario, o puedes buscar por id_doctor y fecha aproximada)
        sql_espera = """
            SELECT * FROM lista_espera 
            WHERE id_doctor = %s AND estado = 'esperando' 
            ORDER BY creado_en ASC LIMIT 1
        """
        cursor.execute(sql_espera, (cita['id_doctor'],))
        siguiente_en_fila = cursor.fetchone()

        if siguiente_en_fila:
            # 4A. Si hay alguien esperando, se le asigna la cita automáticamente
            sql_nueva_cita = """
                INSERT INTO citas (id_paciente, id_doctor, fecha_hora, motivo, estado)
                VALUES (%s, %s, %s, %s, 'pendiente')
            """
            cursor.execute(sql_nueva_cita, (
                siguiente_en_fila['id_paciente'], 
                siguiente_en_fila['id_doctor'], 
                cita['fecha_hora'], 
                siguiente_en_fila['motivo']
            ))

            # Actualizar la lista de espera de esa persona a 'promovido'
            cursor.execute(
                "UPDATE lista_espera SET estado = 'promovido' WHERE id_espera = %s", 
                (siguiente_en_fila['id_espera'],)
            )
        else:
            # 4B. Si NO hay nadie en espera, se libera el cupo sumando 1
            # (Nota: Asegúrate de tener una forma de vincular el horario exacto si manejas id_horario)
            pass # Aquí puedes actualizar cupos_disponibles si vinculas el id_horario

        conexion.commit()
        return {"mensaje": "Cita cancelada exitosamente y cupo reasignado (si había gente en espera)."}

    except Exception as e:
        conexion.rollback()
        return {"error": str(e)}


@app.get("/api/derivaciones/paciente/{id_paciente}")
def obtener_derivaciones_paciente(id_paciente: int):
    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor(dictionary=True)
        
        sql = """SELECT 
                    id_derivacion AS id, 
                    id_paciente, 
                    id_doctor_origen, 
                    institucion_destino AS centro_destino, 
                    motivo, 
                    DATE_FORMAT(fecha_derivacion, '%Y-%m-%d') AS fecha_solicitud, 
                    estado,
                    observaciones 
                 FROM derivaciones 
                 WHERE id_paciente = %s 
                 ORDER BY fecha_derivacion DESC"""
                 
        cursor.execute(sql, (id_paciente,))
        resultados = cursor.fetchall()
        
        return resultados
    
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Error BD: {e}")
    
    finally:
        if 'conexion' in locals() and conexion.is_connected():
            cursor.close()
            conexion.close()

    
    finally:
        cursor.close()
        conexion.close()


@app.get("/api/bajas-medicas")
def obtener_bajas_medicas():
    try:
        conexion = obtener_conexion()
        cursor = conexion.cursor(dictionary=True)

        sql = """SELECT 
                    id,
                    nro_certificado,
                    paciente,
                    matricula,
                    doctor,
                    especialidad,
                    tipo_baja,
                    dias_incapacidad,
                    DATE_FORMAT(fecha_inicio, '%d/%m/%Y') AS fecha_inicio,
                    DATE_FORMAT(fecha_fin, '%d/%m/%Y') AS fecha_fin,
                    diagnostico,
                    estado
                FROM bajas_medicas
                ORDER BY id DESC"""

        cursor.execute(sql)
        resultados = cursor.fetchall()

        return resultados

    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Error BD: {e}")
    finally:
        if 'conexion' in locals() and conexion.is_connected():
            cursor.close()
            conexion.close()  
