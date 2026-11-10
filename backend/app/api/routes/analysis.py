"""
Cognivibe AI - Analysis API Endpoints
Handles:
1. Text & Hinglish analysis requests
2. Social media post analysis requests
3. Context-aware multi-turn analysis
4. User history retrieval, single item deletion, and history clearing
"""

from typing import Dict, Any, Tuple, Optional, List
from backend.app.database.session import DatabaseService
from ml_engine.inference.predictor import predictor


def handle_analyze_text(body: Dict[str, Any], current_user: Optional[Dict[str, Any]]) -> Tuple[int, Dict[str, Any]]:
    text = body.get("text", "").strip()
    if not text:
        return 400, {"detail": "Text cannot be empty."}

    source_type = body.get("source_type", "web_dashboard")
    include_context = body.get("include_context", False)

    history_records: List[Dict[str, Any]] = []
    if include_context and current_user:
        raw_history = DatabaseService.get_analysis_history(current_user["user_id"], limit=5)
        for h in reversed(raw_history):
            history_records.append({
                "emotion": h.get("predicted_emotion"),
                "depression_related": h.get("depression_related"),
                "indicator": h.get("predicted_indicator")
            })

    # Run ML analysis
    result = predictor.analyze(text, history=history_records)

    # Save to history if user is authenticated and consent is active
    analysis_id = None
    if current_user:
        consent = DatabaseService.get_user_consent(current_user["user_id"])
        if consent.get("consent_status", 1) == 1:
            analysis_id = DatabaseService.save_analysis(current_user["user_id"], source_type, result)

    result["analysis_id"] = analysis_id
    result["saved_to_history"] = bool(analysis_id)
    return 200, result


def handle_analyze_post(body: Dict[str, Any], current_user: Optional[Dict[str, Any]]) -> Tuple[int, Dict[str, Any]]:
    content = body.get("post_content", "").strip()
    platform = body.get("platform", "generic_social")

    if not content:
        return 400, {"detail": "Post content cannot be empty."}

    body_wrapper = {
        "text": content,
        "source_type": f"social_post_{platform.lower()}",
        "include_context": body.get("include_context", False)
    }
    return handle_analyze_text(body_wrapper, current_user)


def handle_analyze_context(body: Dict[str, Any], current_user: Optional[Dict[str, Any]]) -> Tuple[int, Dict[str, Any]]:
    current_text = body.get("current_text", "").strip()
    history = body.get("history", [])

    if not current_text:
        return 400, {"detail": "current_text cannot be empty."}

    result = predictor.analyze(current_text, history=history)
    return 200, result


def handle_get_history(current_user: Optional[Dict[str, Any]], limit: int = 50) -> Tuple[int, Dict[str, Any]]:
    if not current_user:
        return 401, {"detail": "Authentication required to view history."}

    records = DatabaseService.get_analysis_history(current_user["user_id"], limit=limit)
    return 200, {
        "total": len(records),
        "history": records
    }


def handle_delete_analysis(analysis_id: str, current_user: Optional[Dict[str, Any]]) -> Tuple[int, Dict[str, Any]]:
    if not current_user:
        return 401, {"detail": "Authentication required."}

    success = DatabaseService.delete_single_analysis(current_user["user_id"], analysis_id)
    return 200, {"success": success, "message": "Record deleted successfully."}


def handle_clear_history(current_user: Optional[Dict[str, Any]]) -> Tuple[int, Dict[str, Any]]:
    if not current_user:
        return 401, {"detail": "Authentication required."}

    DatabaseService.clear_user_history(current_user["user_id"])
    return 200, {"success": True, "message": "Analysis history cleared completely."}

