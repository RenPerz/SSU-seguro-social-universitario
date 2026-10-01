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