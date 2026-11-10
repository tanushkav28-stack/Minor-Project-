"""
Cognivibe AI - Cryptographic Security & Authentication Utilities
Implements:
1. PBKDF2-HMAC-SHA256 secure password hashing with unique salt
2. Standard JWT (JSON Web Token) encoding and verification (RFC 7519)
"""

import hmac
import hashlib
import base64
import json
import secrets
import time
from typing import Dict, Any, Optional
from backend.app.core.config import settings


def hash_password(password: str) -> str:
    """Hashes a password using PBKDF2-HMAC-SHA256 with a cryptographically secure 16-byte salt."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return f"{salt}${key.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against the stored salt$hash string."""
    try:
        salt, stored_hash = hashed_password.split('$')
        new_hash = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        )
        return hmac.compare_digest(new_hash.hex(), stored_hash)
    except Exception:
        return False


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')


def _b64url_decode(s: str) -> bytes:
    padding = '=' * (4 - (len(s) % 4))
    return base64.urlsafe_b64decode(s + padding)


def create_access_token(data: Dict[str, Any], expires_delta_minutes: Optional[int] = None) -> str:
    """Creates a signed JWT access token."""
    to_encode = data.copy()
    expire_minutes = expires_delta_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES
    expire_time = int(time.time()) + (expire_minutes * 60)
    to_encode.update({"exp": expire_time})

    header = {"alg": "HS256", "typ": "JWT"}
    header_bytes = json.dumps(header, separators=(',', ':')).encode('utf-8')
    payload_bytes = json.dumps(to_encode, separators=(',', ':')).encode('utf-8')

    segments = [
        _b64url_encode(header_bytes),
        _b64url_encode(payload_bytes)
    ]
    signing_input = '.'.join(segments).encode('utf-8')
    signature = hmac.new(settings.SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
    segments.append(_b64url_encode(signature))

    return '.'.join(segments)


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and cryptographically verifies a JWT token."""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None

        header_b64, payload_b64, signature_b64 = parts
        signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
        expected_sig = hmac.new(settings.SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
        actual_sig = _b64url_decode(signature_b64)

        if not hmac.compare_digest(expected_sig, actual_sig):
            return None

        payload = json.loads(_b64url_decode(payload_b64).decode('utf-8'))
        exp = payload.get("exp")
        if exp and int(time.time()) > exp:
            return None  # Token expired

        return payload
    except Exception:
        return None

