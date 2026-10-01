import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()


def obtener_conexion():
    """Devuelve una conexión nueva a MySQL."""
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "12345"),
        database=os.getenv("DB_NAME", "ssu_db"),
    )