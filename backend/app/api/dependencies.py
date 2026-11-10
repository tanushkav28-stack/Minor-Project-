"""
Cognivibe AI - API Dependencies (Authentication & Security)
Supports:
1. Bearer JWT tokens from the React Web App
2. X-Extension-Token API keys from the Chrome/Edge Browser Extension
"""

from typing import Optional, Dict, Any
from backend.app.core.security import decode_access_token
from backend.app.database.session import DatabaseService


def get_current_user_from_headers(headers: Dict[str, str]) -> Optional[Dict[str, Any]]:
    """Extracts user from Bearer Authorization header or X-Extension-Token header."""
    # Normalize headers to lowercase
    lower_headers = {k.lower(): v for k, v in headers.items()}

    # 1. Check Extension Token header first
    ext_token = lower_headers.get("x-extension-token")
    if ext_token:
        user = DatabaseService.get_user_by_extension_token(ext_token)
        if user:
            return user

    # 2. Check Bearer Authorization token
    auth_header = lower_headers.get("authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1].strip()
        payload = decode_access_token(token)
        if payload and "sub" in payload:
            user = DatabaseService.get_user_by_id(payload["sub"])
            if user:
                return user

    return None

