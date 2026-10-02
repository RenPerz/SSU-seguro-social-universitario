import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()


def obtener_conexion():
    conexion = mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "12345"),
        database=os.getenv("DB_NAME", "ssu_db"),
        autocommit=True
    )
    # <-- Añade esto temporalmente para ver en la terminal
    print(f"-> Conectado exitosamente a la BD: {conexion.database} en el puerto {conexion.server_host if hasattr(conexion, 'server_host') else 'default'}")
    return conexion