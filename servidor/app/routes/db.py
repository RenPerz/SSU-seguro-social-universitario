from fastapi import APIRouter, HTTPException, status

from app.database.connection import get_db_status, get_db_connection

router = APIRouter(prefix="/api", tags=["database"])


@router.get("/db/health")
def db_health():
    status_data = get_db_status()
    if status_data["status"] != "ok":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=status_data,
        )
    return status_data


@router.get("/usuarios")
def listar_usuarios():
    db_status = get_db_status()
    if db_status["status"] != "ok":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=db_status,
        )

    connection = get_db_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "SELECT id_usuario, nombres, apellidos, ci, email, telefono, tipo_usuario, fecha_nacimiento FROM usuarios ORDER BY id_usuario"
        )
        rows = cursor.fetchall()
        return rows
    finally:
        cursor.close()
        connection.close()
