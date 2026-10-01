from fastapi import APIRouter

from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest
from app.services.auth_service import login_user, register_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=201)
def register(data: RegisterRequest) -> AuthResponse:
    return register_user(data)


@router.post("/login", response_model=AuthResponse)
def login(data: LoginRequest) -> AuthResponse:
    return login_user(data)
