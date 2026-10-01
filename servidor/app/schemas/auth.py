from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator


Role = Literal["estudiante", "medico", "administrador"]


class UserPublic(BaseModel):
    id: int
    nombres: str
    apellidos: str
    carnet: str
    email: EmailStr
    telefono: str | None = None
    rol: Role
    estado: str


class RegisterRequest(BaseModel):
    nombres: str = Field(..., min_length=2, max_length=100)
    apellidos: str = Field(..., min_length=2, max_length=100)
    carnet: str = Field(..., min_length=4, max_length=20)
    email: EmailStr
    telefono: str | None = Field(default=None, max_length=30)
    password: str = Field(..., min_length=8, max_length=128)
    rol: Literal["estudiante"] = "estudiante"

    @field_validator("carnet", "nombres", "apellidos")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip()


class UserUpdate(BaseModel):
    nombres: str = Field(..., min_length=2, max_length=100)
    apellidos: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    telefono: str | None = Field(default=None, max_length=30)


class LoginRequest(BaseModel):
    identifier: str = Field(..., min_length=3, max_length=120)
    password: str = Field(..., min_length=1, max_length=128)


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic
