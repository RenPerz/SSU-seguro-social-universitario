import os
import logging
from pathlib import Path

import mysql.connector
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")
logger = logging.getLogger(__name__)


def get_db_config() -> dict:
    user = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD")
    if not user or not password:
        raise RuntimeError("Configura DB_USER y DB_PASSWORD en el archivo .env del servidor.")

    return {
        "host": os.getenv("DB_HOST", "localhost"),
        "port": int(os.getenv("DB_PORT", "3306")),
        "user": user,
        "password": password,
        "database": os.getenv("DB_NAME", "seguro_social_universitario"),
        "autocommit": True,
        "charset": "utf8mb4",
        "raise_on_warnings": True,
    }


def get_db_connection():
    return mysql.connector.connect(**get_db_config())


def get_db_status() -> dict:
    try:
        connection = get_db_connection()
        connection.close()
        return {
            "status": "ok",
            "database": os.getenv("DB_NAME", "seguro_social_universitario"),
            "host": os.getenv("DB_HOST", "localhost"),
        }
    except Exception:  # pragma: no cover - depende del entorno de MySQL local
        logger.exception("No se pudo conectar a la base de datos MySQL.")
        return {
            "status": "error",
            "database": os.getenv("DB_NAME", "seguro_social_universitario"),
            "host": os.getenv("DB_HOST", "localhost"),
        }
