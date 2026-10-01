import os
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import HTTPException, status
from pwdlib import PasswordHash

from app.database.connection import get_db_connection, get_db_status
from app.database.mock_db import usuarios_db
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, UserPublic, UserUpdate

JWT_SECRET = os.getenv("JWT_SECRET", "")
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "120"))
password_hasher = PasswordHash.recommended()


def _public_user(record: dict) -> UserPublic:
    return UserPublic(
        id=int(record["id"]),
        nombres=record["nombres"],
        apellidos=record["apellidos"],
        carnet=record["carnet"],
        email=record["email"],
        telefono=record.get("telefono"),
        rol=record.get("rol", "estudiante"),
        estado=record.get("estado", "ACTIVO"),
    )


def _create_token(user: UserPublic) -> str:
    if not JWT_SECRET:
        raise RuntimeError("JWT_SECRET no está configurado en el entorno.")
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user.id),
        "role": user.rol,
        "iat": now,
        "exp": now + timedelta(minutes=TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _find_mock(identifier: str) -> dict | None:
    normalized = identifier.strip().lower()
    return next(
        (
            user
            for user in usuarios_db
            if user["email"].lower() == normalized or user["carnet"].lower() == normalized
        ),
        None,
    )


def _find_mysql(identifier: str) -> dict | None:
    if get_db_status()["status"] != "ok":
        return None
    connection = get_db_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT id_usuario AS id, nombres, apellidos, ci AS carnet, email,
                   telefono, password_hash, COALESCE(rol, tipo_usuario, 'estudiante') AS rol,
                   COALESCE(estado, 'ACTIVO') AS estado
            FROM usuarios
            WHERE LOWER(email) = LOWER(%s) OR LOWER(ci) = LOWER(%s)
            LIMIT 1
            """,
            (identifier.strip(), identifier.strip()),
        )
        return cursor.fetchone()
    finally:
        cursor.close()
        connection.close()


def _save_mysql(data: RegisterRequest, password_hash: str) -> dict | None:
    if get_db_status()["status"] != "ok":
        return None
    connection = get_db_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            INSERT INTO usuarios
                (nombres, apellidos, ci, email, telefono, password_hash, rol, estado)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'ACTIVO')
            """,
            (data.nombres, data.apellidos, data.carnet, str(data.email), data.telefono,
             password_hash, data.rol),
        )
        user_id = cursor.lastrowid
        return {
            "id": user_id,
            "nombres": data.nombres,
            "apellidos": data.apellidos,
            "carnet": data.carnet,
            "email": str(data.email),
            "telefono": data.telefono,
            "rol": data.rol,
            "estado": "ACTIVO",
            "password_hash": password_hash,
        }
    finally:
        cursor.close()
        connection.close()


def register_user(data: RegisterRequest) -> AuthResponse:
    password_hash = password_hasher.hash(data.password)
    existing = _find_mysql(data.email) or _find_mysql(data.carnet) if get_db_status()["status"] == "ok" else None
    if existing or _find_mock(str(data.email)) or _find_mock(data.carnet):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El email o carnet ya está registrado.")

    user = _save_mysql(data, password_hash)
    if user is None:
        user = {
            "id": max((item["id"] for item in usuarios_db), default=100) + 1,
            "nombres": data.nombres,
            "apellidos": data.apellidos,
            "carnet": data.carnet,
            "email": str(data.email),
            "telefono": data.telefono,
            "password_hash": password_hash,
            "rol": data.rol,
            "estado": "ACTIVO",
        }
        usuarios_db.append(user)

    public_user = _public_user(user)
    return AuthResponse(access_token=_create_token(public_user), user=public_user)


def login_user(data: LoginRequest) -> AuthResponse:
    user = _find_mysql(data.identifier) if get_db_status()["status"] == "ok" else None
    user = user or _find_mock(data.identifier)
    if user is None or not password_hasher.verify(data.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales incorrectas.")
    if user.get("estado", "ACTIVO") != "ACTIVO":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="El usuario está inactivo.")

    public_user = _public_user(user)
    return AuthResponse(access_token=_create_token(public_user), user=public_user)


def get_user_by_id(user_id: int) -> UserPublic | None:
    user = next((item for item in usuarios_db if item["id"] == user_id), None)
    if user is not None:
        return _public_user(user)

    if get_db_status()["status"] != "ok":
        return None
    connection = get_db_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT id_usuario AS id, nombres, apellidos, ci AS carnet, email,
                   telefono, COALESCE(rol, tipo_usuario, 'estudiante') AS rol,
                   COALESCE(estado, 'ACTIVO') AS estado
            FROM usuarios WHERE id_usuario = %s
            """,
            (user_id,),
        )
        row = cursor.fetchone()
        return _public_user(row) if row else None
    finally:
        cursor.close()
        connection.close()


def update_user(user_id: int, data: UserUpdate) -> UserPublic:
    duplicate = next(
        (item for item in usuarios_db if item["email"].lower() == str(data.email).lower() and item["id"] != user_id),
        None,
    )
    if duplicate:
        raise ValueError("El email ya está registrado por otro usuario.")

    if get_db_status()["status"] == "ok":
        connection = get_db_connection()
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT id_usuario FROM usuarios WHERE LOWER(email) = LOWER(%s) AND id_usuario <> %s", (str(data.email), user_id))
            if cursor.fetchone():
                raise ValueError("El email ya está registrado por otro usuario.")
            cursor.execute(
                "UPDATE usuarios SET nombres = %s, apellidos = %s, email = %s, telefono = %s WHERE id_usuario = %s",
                (data.nombres, data.apellidos, str(data.email), data.telefono, user_id),
            )
        finally:
            cursor.close()
            connection.close()
    else:
        user = next((item for item in usuarios_db if item["id"] == user_id), None)
        if user is None:
            raise ValueError("Usuario no encontrado.")
        user.update(data.model_dump())

    updated = get_user_by_id(user_id)
    if updated is None:
        raise ValueError("Usuario no encontrado.")
    return updated
