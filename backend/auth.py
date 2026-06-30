import datetime
from typing import Optional

import jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY = "aura-secret-mobility-token-key-2026"
ALGORITHM = "HS256"

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

security_scheme = HTTPBearer()


def hash_password(password):
    password = str(password)[:72]
    return pwd_context.hash(password)
def verify_password(plain_password, hashed_password):
    plain_password = str(plain_password)[:72]
    return pwd_context.verify(
        plain_password,
        hashed_password
    )

def create_access_token(
    data: dict,
    expires_delta: Optional[datetime.timedelta] = None
) -> str:

    to_encode = data.copy()

    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(days=7)

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt


def get_current_user_jwt(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
) -> dict:

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
