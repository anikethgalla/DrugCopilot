import time
import secrets
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from app.auth.security import (
    User,
    UserInDB,
    USERS_DB,
    authenticate_user,
    create_access_token,
    hash_password,
    list_users
)
from app.auth.dependencies import get_current_user, require_role

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User
    default_portal: str  # "/admin" for admin, "/copilot" for user


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    institution: Optional[str] = "Biomedical Institute"
    role: Optional[str] = "user"  # "user" or "admin"


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Authenticate via email and password, returning JWT bearer token and role details."""
    user = authenticate_user(request.email, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = create_access_token({
        "sub": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role
    })

    default_portal = "/admin" if user.role == "admin" else "/copilot"

    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user=user,
        default_portal=default_portal
    )


@router.get("/me", response_model=User)
async def get_authenticated_user(current_user: User = Depends(get_current_user)):
    """Retrieve profile and permissions for currently authenticated user (via JWT or Basic Auth)."""
    return current_user


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Log out authenticated session."""
    return {"status": "success", "message": f"User {current_user.email} logged out successfully."}


@router.post("/register", response_model=User)
async def register_user(request: RegisterRequest):
    """Register a new user account."""
    clean_email = request.email.lower().strip()
    if clean_email in USERS_DB:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    assigned_role = "admin" if request.role == "admin" else "user"
    pw_hash, pw_salt = hash_password(request.password)
    new_user_id = f"usr_{secrets.token_hex(6)}"

    user_db = UserInDB(
        id=new_user_id,
        email=clean_email,
        name=request.name.strip(),
        role=assigned_role,
        institution=request.institution or "Biomedical Institute",
        is_active=True,
        created_at=time.time(),
        password_hash=pw_hash,
        salt=pw_salt
    )
    USERS_DB[clean_email] = user_db

    return User(**user_db.model_dump(exclude={"password_hash", "salt"}))


@router.get("/users", response_model=List[User])
async def get_all_users(admin_user: User = Depends(require_role(["admin"]))):
    """List all registered system users and their roles (Admin only)."""
    return list_users()
