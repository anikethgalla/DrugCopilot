import base64
from typing import Optional, List
from fastapi import Header, HTTPException, status, Depends
from app.auth.security import (
    User, 
    decode_access_token, 
    get_user_by_email, 
    authenticate_user
)


async def get_current_user(
    authorization: Optional[str] = Header(None)
) -> User:
    """
    Extracts and authenticates user from either:
    1. HTTP Bearer JWT token: 'Authorization: Bearer <jwt_token>'
    2. HTTP Basic Auth: 'Authorization: Basic <base64(email:password)>'
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided. Use Bearer token or Basic Auth.",
            headers={"WWW-Authenticate": "Bearer, Basic"},
        )

    scheme, _, param = authorization.partition(" ")
    scheme = scheme.lower()

    # 1. Bearer Token Authentication (JWT)
    if scheme == "bearer":
        payload = decode_access_token(param)
        if not payload or "email" not in payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired access token.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user_in_db = get_user_by_email(payload["email"])
        if not user_in_db or not user_in_db.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account inactive or not found.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return User(**user_in_db.model_dump(exclude={"password_hash", "salt"}))

    # 2. HTTP Basic Authentication
    elif scheme == "basic":
        try:
            decoded = base64.b64decode(param).decode("utf-8")
            username, _, password = decoded.partition(":")
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Basic authentication encoding.",
                headers={"WWW-Authenticate": "Basic"},
            )

        user = authenticate_user(username, password)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
                headers={"WWW-Authenticate": "Basic"},
            )
        return user

    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Unsupported authentication scheme '{scheme}'. Expected 'Bearer' or 'Basic'.",
            headers={"WWW-Authenticate": "Bearer, Basic"},
        )


async def get_optional_user(
    authorization: Optional[str] = Header(None)
) -> Optional[User]:
    """Returns authenticated user if valid credentials are provided, else None."""
    if not authorization:
        return None
    try:
        return await get_current_user(authorization=authorization)
    except HTTPException:
        return None


def require_role(allowed_roles: List[str]):
    """
    Dependency factory to enforce Role-Based Access Control (RBAC).
    Usage: Depends(require_role(["admin"]))
    """
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: Access requires role in {allowed_roles}. Current role: '{current_user.role}'.",
            )
        return current_user

    return role_checker
