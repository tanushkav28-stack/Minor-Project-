"""
Cognivibe AI - Authentication API Endpoints
Handles user registration, login, profile retrieval, and extension pairing tokens.
"""

from typing import Dict, Any, Tuple
from backend.app.core.security import hash_password, verify_password, create_access_token
from backend.app.database.session import DatabaseService


def handle_register(body: Dict[str, Any]) -> Tuple[int, Dict[str, Any]]:
    name = body.get("name", "").strip()
    email = body.get("email", "").strip().lower()
    password = body.get("password", "").strip()

    if not name or not email or not password:
        return 400, {"detail": "Name, email, and password are required."}

    if len(password) < 6:
        return 400, {"detail": "Password must be at least 6 characters long."}

    existing = DatabaseService.get_user_by_email(email)
    if existing:
        return 409, {"detail": "An account with this email already exists."}

    user = DatabaseService.create_user(
        name=name,
        email=email,
        password_hash=hash_password(password)
    )

    token = create_access_token({"sub": user["user_id"], "email": user["email"]})
    return 201, {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "user_id": user["user_id"],
            "name": user["name"],
            "email": user["email"],
            "extension_token": user["extension_token"]
        }
    }


def handle_login(body: Dict[str, Any]) -> Tuple[int, Dict[str, Any]]:
    email = body.get("email", "").strip().lower()
    password = body.get("password", "").strip()

    if not email or not password:
        return 400, {"detail": "Email and password are required."}

    user = DatabaseService.get_user_by_email(email)
    if not user and email in ("demo@aura.health", "demo@aura.ai"):
        user = DatabaseService.get_user_by_email("demo@cognivibe.ai")

    if not user:
        return 401, {"detail": "Invalid email or password."}

    if not verify_password(password, user["password_hash"]):
        return 401, {"detail": "Invalid email or password."}

    token = create_access_token({"sub": user["user_id"], "email": user["email"]})
    return 200, {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "user_id": user["user_id"],
            "name": user["name"],
            "email": user["email"],
            "extension_token": user["extension_token"]
        }
    }


def handle_me(current_user: Dict[str, Any]) -> Tuple[int, Dict[str, Any]]:
    if not current_user:
        return 401, {"detail": "Not authenticated."}

    consent = DatabaseService.get_user_consent(current_user["user_id"])
    return 200, {
        "user_id": current_user["user_id"],
        "name": current_user["name"],
        "email": current_user["email"],
        "extension_token": current_user.get("extension_token"),
        "consent": consent
    }

