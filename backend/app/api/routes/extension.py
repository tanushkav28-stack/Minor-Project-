"""
Cognivibe AI - Browser Extension API Endpoints (Step 8 & 9)
Enables pairing, token validation, and social media text analysis requests.
"""

from typing import Dict, Any, Tuple, Optional
from backend.app.database.session import DatabaseService
from ml_engine.inference.predictor import predictor


def handle_extension_connect(body: Dict[str, Any]) -> Tuple[int, Dict[str, Any]]:
    token = body.get("extension_token", "").strip()
    browser_type = body.get("browser_type", "Chrome")

    if not token:
        return 400, {"detail": "extension_token is required."}

    user = DatabaseService.get_user_by_extension_token(token)
    if not user:
        return 404, {"detail": "Invalid or expired extension token. Please copy the token from your Web Dashboard Settings."}

    return 200, {
        "status": "connected",
        "user_id": user["user_id"],
        "name": user["name"],
        "email": user["email"],
        "browser_type": browser_type,
        "message": "Browser extension paired successfully."
    }


def handle_extension_status(current_user: Optional[Dict[str, Any]]) -> Tuple[int, Dict[str, Any]]:
    if not current_user:
        return 401, {"detail": "Not authenticated."}

    return 200, {
        "connected": True,
        "user_id": current_user["user_id"],
        "name": current_user["name"],
        "extension_token": current_user.get("extension_token")
    }


def handle_extension_analyze(body: Dict[str, Any], current_user: Optional[Dict[str, Any]]) -> Tuple[int, Dict[str, Any]]:
    text = body.get("text", "").strip()
    platform = body.get("platform", "generic_web")
    element_type = body.get("element_type", "selection")

    if not text:
        return 400, {"detail": "Text cannot be empty."}

    # Analyze with ML
    result = predictor.analyze(text)

    # Save to history if paired user
    analysis_id = None
    if current_user:
        consent = DatabaseService.get_user_consent(current_user["user_id"])
        if consent.get("allow_extension_analysis", 1) == 1:
            source = f"browser_extension_{platform.lower()}_{element_type}"
            analysis_id = DatabaseService.save_analysis(current_user["user_id"], source, result)

    result["analysis_id"] = analysis_id
    result["saved_to_history"] = bool(analysis_id)
    return 200, result

