from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="API SSU Cochabamba")

# Habilitar CORS para que React (localhost:5173) pueda conectarse sin bloqueos
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Función de conexión a la base de datos
def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "sisinfo2"),
        database=os.getenv("DB_NAME", "ssu_db"),
        port=int(os.getenv("DB_PORT", 3306))
    )

@app.get("/")
def raiz():
    return {"mensaje": "Servidor backend de SSU en Python funcionando correctamente"}

@app.get("/api/estado")
def verificar_estado():
    return {
        "estado": "activo",
        "lenguaje": "Python",
        "framework": "FastAPI"
    }

# Prueba de conexión a la base de datos
@app.get("/api/test-db")
def probar_db():
    try:
        conexion = get_db_connection()
        if conexion.is_connected():
            conexion.close()
            return {"status": "ok", "mensaje": "Conexión exitosa a MySQL"}
    except Exception as e:
        return {"status": "error", "detalle": str(e)}

# TRASLADOS Y DERIVACIONES MÉDICAS (CONSULTA PACIENTE)

@app.get("/api/derivaciones/paciente/{id_paciente}")
def obtener_derivaciones_paciente(id_paciente: int):
    try:
        conexion = get_db_connection()
        cursor = conexion.cursor(dictionary=True)
        
        sql = """SELECT id, id_paciente, centro_origen, centro_destino, medico_derivante, motivo, 
                        DATE_FORMAT(fecha_solicitud, '%Y-%m-%d') as fecha_solicitud, estado 
                 FROM derivaciones_medicas 
                 WHERE id_paciente = %s 
                 ORDER BY fecha_solicitud DESC"""
                 
        cursor.execute(sql, (id_paciente,))
        resultados = cursor.fetchall()
        
        return resultados
    
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Error de base de datos: {err}")
    
    finally:
        if 'conexion' in locals() and conexion.is_connected():
            cursor.close()
            conexion.close()