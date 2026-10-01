import os
from pathlib import Path

import mysql.connector
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")


def get_db_config() -> dict:
    return {
        "host": os.getenv("DB_HOST", "localhost"),
        "port": int(os.getenv("DB_PORT", "3306")),
        "user": os.getenv("DB_USER", "root"),
        "password": os.getenv("DB_PASSWORD", ""),
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
    except Exception as exc:  # pragma: no cover - depende del entorno de MySQL local
        return {
            "status": "error",
            "database": os.getenv("DB_NAME", "seguro_social_universitario"),
            "host": os.getenv("DB_HOST", "localhost"),
            "detail": str(exc),
        }
