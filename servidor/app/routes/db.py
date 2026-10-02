from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_user, require_roles
from app.database.connection import get_db_status, get_db_connection
from app.schemas.auth import UserUpdate
from app.services.auth_service import get_user_by_id, update_user

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


@router.get("/usuarios", dependencies=[Depends(require_roles("administrador"))])
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


@router.get("/usuarios/me")
def obtener_usuario_actual(current_user: dict = Depends(get_current_user)):
    user = get_user_by_id(int(current_user["sub"]))
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado.")
    return user


@router.put("/usuarios/me")
def actualizar_usuario_actual(
    data: UserUpdate,
    current_user: dict = Depends(get_current_user),
):
    try:
        return update_user(int(current_user["sub"]), data)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
