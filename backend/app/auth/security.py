import base64
import hashlib
import hmac
import json
import time
import secrets
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, EmailStr
from app.config import settings

SECRET_KEY = getattr(settings, "AUTH_SECRET_KEY", "drugcopilot-super-secure-biomedical-jwt-key-2025")
TOKEN_EXPIRE_SECONDS = 86400 * 7  # 7 days


class User(BaseModel):
    id: str
    email: str
    name: str
    role: str  # "admin" or "user"
    institution: Optional[str] = "Biomedical Institute"
    is_active: bool = True
    created_at: float = 0.0


class UserInDB(User):
    password_hash: str
    salt: str


# Helper functions for Base64URL encoding (RFC 7519 JWT standard)
def base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')


def base64url_decode(data: str) -> bytes:
    padding = '=' * (4 - (len(data) % 4)) if len(data) % 4 != 0 else ''
    return base64.urlsafe_b64decode(data + padding)


def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    """Hashes a password using PBKDF2-HMAC-SHA256 with 100,000 iterations."""
    if not salt:
        salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return key.hex(), salt


def verify_password(plain_password: str, password_hash: str, salt: str) -> bool:
    """Verifies a password against the stored hash in constant time."""
    computed_hash, _ = hash_password(plain_password, salt)
    return hmac.compare_digest(computed_hash, password_hash)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[int] = None) -> str:
    """Creates an RFC 7519 compliant HS256 JWT access token."""
    header = {"alg": "HS256", "typ": "JWT"}
    payload = data.copy()
    
    now = int(time.time())
    expire = now + (expires_delta if expires_delta is not None else TOKEN_EXPIRE_SECONDS)
    payload.update({"iat": now, "exp": expire})

    encoded_header = base64url_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    encoded_payload = base64url_encode(json.dumps(payload, separators=(',', ':')).encode('utf-8'))

    signing_input = f"{encoded_header}.{encoded_payload}".encode('utf-8')
    signature = hmac.new(SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
    encoded_signature = base64url_encode(signature)

    return f"{encoded_header}.{encoded_payload}.{encoded_signature}"


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates an RFC 7519 HS256 JWT token."""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        
        encoded_header, encoded_payload, encoded_signature = parts
        signing_input = f"{encoded_header}.{encoded_payload}".encode('utf-8')
        expected_sig = hmac.new(SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
        provided_sig = base64url_decode(encoded_signature)

        if not hmac.compare_digest(expected_sig, provided_sig):
            return None

        payload_bytes = base64url_decode(encoded_payload)
        payload = json.loads(payload_bytes.decode('utf-8'))

        now = int(time.time())
        if "exp" in payload and payload["exp"] < now:
            return None  # Token expired

        return payload
    except Exception:
        return None


# Seed default credentials
_admin_hash, _admin_salt = hash_password("Admin@2025!")
_user_hash, _user_salt = hash_password("User@2025!")
_researcher_hash, _researcher_salt = hash_password("Research@2025!")

USERS_DB: Dict[str, UserInDB] = {
    "admin@drugcopilot.org": UserInDB(
        id="usr_admin_001",
        email="admin@drugcopilot.org",
        name="Lead Administrator",
        role="admin",
        institution="Biomedical Operations",
        is_active=True,
        created_at=time.time(),
        password_hash=_admin_hash,
        salt=_admin_salt
    ),
    "user@drugcopilot.org": UserInDB(
        id="usr_researcher_001",
        email="user@drugcopilot.org",
        name="Biomedical Researcher",
        role="user",
        institution="Computational Biology Lab",
        is_active=True,
        created_at=time.time(),
        password_hash=_user_hash,
        salt=_user_salt
    ),
    "researcher@drugcopilot.org": UserInDB(
        id="usr_researcher_002",
        email="researcher@drugcopilot.org",
        name="Senior Pharmacologist",
        role="user",
        institution="Target Discovery Unit",
        is_active=True,
        created_at=time.time(),
        password_hash=_researcher_hash,
        salt=_researcher_salt
    )
}


def get_user_by_email(email: str) -> Optional[UserInDB]:
    return USERS_DB.get(email.lower().strip())


def authenticate_user(email: str, password: str) -> Optional[User]:
    user = get_user_by_email(email)
    if not user:
        return None
    if not verify_password(password, user.password_hash, user.salt):
        return None
    return User(**user.model_dump(exclude={"password_hash", "salt"}))


def list_users() -> List[User]:
    return [User(**u.model_dump(exclude={"password_hash", "salt"})) for u in USERS_DB.values()]
