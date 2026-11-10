"""
Cognivibe AI - User & Privacy Settings API Endpoints
"""

from typing import Dict, Any, Tuple, Optional
from backend.app.database.session import DatabaseService


def handle_get_profile(current_user: Optional[Dict[str, Any]]) -> Tuple[int, Dict[str, Any]]:
    if not current_user:
        return 401, {"detail": "Authentication required."}
    return 200, current_user


def handle_update_profile(body: Dict[str, Any], current_user: Optional[Dict[str, Any]]) -> Tuple[int, Dict[str, Any]]:
    if not current_user:
        return 401, {"detail": "Authentication required."}

    name = body.get("name", "").strip()
    if not name:
        return 400, {"detail": "Name cannot be empty."}

    DatabaseService.update_user_profile(current_user["user_id"], name)
    current_user["name"] = name
    return 200, current_user


def handle_get_privacy(current_user: Optional[Dict[str, Any]]) -> Tuple[int, Dict[str, Any]]:
    if not current_user:
        return 401, {"detail": "Authentication required."}

    consent = DatabaseService.get_user_consent(current_user["user_id"])
    return 200, consent


def handle_update_privacy(body: Dict[str, Any], current_user: Optional[Dict[str, Any]]) -> Tuple[int, Dict[str, Any]]:
    if not current_user:
        return 401, {"detail": "Authentication required."}

    consent_status = int(body.get("consent_status", 1))
    retention_days = int(body.get("retention_days", 30))
    allow_extension = int(body.get("allow_extension_analysis", 1))

    DatabaseService.update_user_consent(
        user_id=current_user["user_id"],
        consent_status=consent_status,
        retention_days=retention_days,
        allow_extension=allow_extension
    )
    return 200, {
        "success": True,
        "message": "Privacy & consent preferences updated successfully."
    }


def handle_delete_account(current_user: Optional[Dict[str, Any]]) -> Tuple[int, Dict[str, Any]]:
    if not current_user:
        return 401, {"detail": "Authentication required."}

    DatabaseService.delete_user_account(current_user["user_id"])
    return 200, {
        "success": True,
        "message": "Account and all associated analysis records deleted permanently."
    }

