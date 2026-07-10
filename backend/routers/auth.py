"""routers/auth.py — Authentication endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import User
from schemas import (
    AuthCurrentUserResponse,
    AuthLoginRequest,
    AuthSignupRequest,
)
from security import (
    ACCESS_TOKEN_COOKIE_NAME,
    create_access_token,
    get_current_user,
    hash_password,
    normalize_email,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _set_session_cookie(response: Response, user_id: int) -> None:
    """Mint a JWT and attach it as an httpOnly cookie."""
    token = create_access_token(user_id)
    response.set_cookie(
        key=ACCESS_TOKEN_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=False,       # True in production behind HTTPS
        samesite="lax",
        max_age=60 * 60 * 24,  # 24 hours
        path="/",
    )


def _build_response(user: User) -> AuthCurrentUserResponse:
    return AuthCurrentUserResponse.model_validate(user)


async def _create_user(
    db: AsyncSession,
    email: str,
    username: str,
    password: str,
) -> User:
    normalized_email = normalize_email(email)

    # Check for duplicate email
    result = await db.execute(
        select(User).where(User.email == normalized_email)
    )
    if result.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered.",
        )

    # Check for duplicate username
    result = await db.execute(
        select(User).where(User.username == username)
    )
    if result.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username is already taken.",
        )

    user = User(
        email=normalized_email,
        username=username,
        hashed_password=hash_password(password),
        xp=0,
        streak=0,
        hearts=5,
        last_active=None,
    )
    db.add(user)
    await db.flush()          # populate user.id
    return user


async def _authenticate_user(
    db: AsyncSession,
    email: str,
    password: str,
) -> User:
    normalized_email = normalize_email(email)

    result = await db.execute(
        select(User).where(User.email == normalized_email)
    )
    user = result.scalar_one_or_none()
    if user is None or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post(
    "/signup",
    response_model=AuthCurrentUserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new user account and set the session cookie",
)
async def signup(
    body: AuthSignupRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> AuthCurrentUserResponse:
    user = await _create_user(
        db=db,
        email=body.email,
        username=body.username,
        password=body.password,
    )
    _set_session_cookie(response, user.id)
    return _build_response(user)


@router.post(
    "/login",
    response_model=AuthCurrentUserResponse,
    summary="Authenticate and set the session cookie",
)
async def login(
    body: AuthLoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> AuthCurrentUserResponse:
    user = await _authenticate_user(
        db=db, email=body.email, password=body.password
    )
    _set_session_cookie(response, user.id)
    return _build_response(user)


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
    summary="Clear the session cookie",
)
async def logout(response: Response) -> Response:
    response.delete_cookie(
        key=ACCESS_TOKEN_COOKIE_NAME,
        path="/",
        secure=False,
        httponly=True,
        samesite="lax",
    )
    response.status_code = status.HTTP_204_NO_CONTENT
    return response


@router.get(
    "/me",
    response_model=AuthCurrentUserResponse,
    summary="Get the current authenticated user",
)
async def me(
    current_user: User = Depends(get_current_user),
) -> AuthCurrentUserResponse:
    return _build_response(current_user)