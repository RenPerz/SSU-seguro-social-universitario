from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="API SSU Cochabamba")

# Habilitar CORS para que React (localhost:5173) pueda conectarse sin bloqueos
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Función reutilizable para conectar a la base de datos
def obtener_conexion():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password="sisinfo2",
        database=os.getenv("DB_NAME", "ssu_db")
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
        conexion = obtener_conexion()
        if conexion.is_connected():
            conexion.close()
            return {"status": "ok", "mensaje": "Conexión exitosa a MySQL"}
    except Exception as e:
        return {"status": "error", "detalle": str(e)}

# --- ENDPOINT DEL BUSCADOR DE MEDICAMENTOS ---
@app.get("/api/medicamentos/buscar")
def buscar_medicamentos(q: str = Query("", description="Nombre o componente a buscar")):
    conexion = obtener_conexion()
    cursor = conexion.cursor(dictionary=True)  # dictionary=True devuelve formato JSON compatible con React
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
        resultados = cursor.fetchall()
        return resultados
    except Exception as e:
        return {"error": str(e)}
    finally:
        cursor.close()
        conexion.close()