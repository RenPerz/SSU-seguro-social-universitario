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
        sql = """
            SELECT 
                id_horario, 
                fecha, 
                TIME_FORMAT(hora_inicio, '%H:%i') AS hora_inicio, 
                TIME_FORMAT(hora_fin, '%H:%i') AS hora_fin, 
                consultorio, 
                cupos_disponibles
            FROM horarios_medicos
            WHERE id_doctor = %s AND cupos_disponibles > 0
            ORDER BY fecha ASC, hora_inicio ASC
        """
        cursor.execute(sql, (id_doctor,))
        return cursor.fetchall()
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
        