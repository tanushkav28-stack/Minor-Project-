"""
Cognivibe AI - Digital Consumption & Mood Intelligence Tracker Routes
Provides endpoints for:
1. Logging active browsing content & time spent from the browser extension
2. Generating comprehensive Daily Intelligence Reports (emotional tone %, categories, AI observations)
3. Generating 7-day Weekly Intelligence Reports with correlation analysis
4. Daily Mood Check-ins ("How did you feel today?") and consumption vs mood correlation
5. Standalone content multi-dimensional classification
6. Privacy controls (clear logs)
"""

from typing import Dict, Any, Tuple, Optional, List
from datetime import datetime, timedelta
from backend.app.database.session import DatabaseService
from ml_engine.inference.content_classifier import content_classifier


MOOD_SCORE_MAP = {
    "happy": 5,
    "calm": 4,
    "neutral": 3,
    "stressed": 2,
    "anxious": 2,
    "sad": 1
}


def handle_log_consumption(body: Dict[str, Any], current_user: Optional[Dict[str, Any]]) -> Tuple[int, Dict[str, Any]]:
    """
    Logs digital content consumption and performs real-time classification.
    Supports both paired accounts (saves to DB) and guest extension mode (returns live classification).
    """
    user_id = current_user["user_id"] if current_user else None
    now = datetime.now()
    default_date = now.strftime("%Y-%m-%d")

    # Check if single item or batch
    items_to_process = []
    if "items" in body and isinstance(body["items"], list):
        items_to_process = body["items"]
    elif "text" in body or "title" in body:
        items_to_process = [body]
    else:
        return 400, {"detail": "No content item or items list provided."}

    processed_items = []
    for item in items_to_process:
        text = item.get("text", "") or item.get("snippet", "")
        title = item.get("title", "")
        domain = item.get("domain", "")
        url = item.get("url", "")
        time_spent = int(item.get("time_spent_seconds", 0))

        # Perform multidimensional classification
        classification = content_classifier.classify(
            text=text,
            title=title,
            domain=domain,
            url=url
        )

        log_entry = {
            "url": url,
            "domain": domain,
            "platform": item.get("platform") or domain or "Web",
            "category": item.get("category") or classification["category"],
            "title": title or classification["title"],
            "content_snippet": text[:500],
            "emotional_tone": classification["emotional_tone"],
            "topic": classification["topic"],
            "emotional_intensity": classification["emotional_intensity"],
            "is_distressing": 1 if classification["is_distressing"] else 0,
            "distressing_theme": classification["distressing_theme"],
            "constructiveness": classification["constructiveness"],
            "time_spent_seconds": time_spent,
            "date": item.get("date") or default_date
        }

        if user_id:
            log_id = DatabaseService.save_consumption_log(user_id, log_entry)
            log_entry["log_id"] = log_id
        else:
            log_entry["log_id"] = "live_preview"

        processed_items.append(log_entry)

    return 201 if user_id else 200, {
        "logged": bool(user_id),
        "count": len(processed_items),
        "items": processed_items
    }


def handle_get_daily_report(query_params: Dict[str, Any], current_user: Optional[Dict[str, Any]]) -> Tuple[int, Dict[str, Any]]:
    """Generates the Daily Digital Consumption & Mood Intelligence Report."""
    if not current_user:
        return 401, {"detail": "Authentication required."}

    user_id = current_user["user_id"]
    target_date = query_params.get("date", [datetime.now().strftime("%Y-%m-%d")])[0]

    daily_data = DatabaseService.get_daily_consumption(user_id, target_date)
    observations = content_classifier.generate_daily_observations(daily_data)

    report = {
        "user_id": user_id,
        "user_name": current_user.get("name", "User"),
        "date": target_date,
        "day_of_week": datetime.strptime(target_date, "%Y-%m-%d").strftime("%A"),
        "total_content_consumption_seconds": daily_data["total_content_consumption_seconds"],
        "total_consumption_formatted": daily_data["total_consumption_formatted"],
        "total_items_analyzed": daily_data["total_items_analyzed"],
        "emotional_distribution": daily_data["emotional_distribution"],
        "category_breakdown": daily_data["category_breakdown"],
        "topic_counts": daily_data["topic_counts"],
        "emotional_intensity": daily_data["emotional_intensity"],
        "constructiveness": daily_data["constructiveness"],
        "distressing_count": daily_data["distressing_count"],
        "ai_observations": observations,
        "mood_checkin": daily_data["mood_checkin"],
        "recent_items": daily_data["recent_items"],
        "disclaimer": "Illustrative dashboard only. Content sentiment and consumption patterns do not establish the user's actual mood or mental health."
    }

    return 200, report


def handle_get_weekly_report(query_params: Dict[str, Any], current_user: Optional[Dict[str, Any]]) -> Tuple[int, Dict[str, Any]]:
    """Generates the 7-day Weekly Digital Wellbeing Intelligence Report."""
    if not current_user:
        return 401, {"detail": "Authentication required."}

    user_id = current_user["user_id"]
    end_date_str = query_params.get("end_date", [datetime.now().strftime("%Y-%m-%d")])[0]
    end_dt = datetime.strptime(end_date_str, "%Y-%m-%d")
    start_dt = end_dt - timedelta(days=6)
    start_date_str = query_params.get("start_date", [start_dt.strftime("%Y-%m-%d")])[0]

    weekly_data = DatabaseService.get_weekly_consumption(user_id, start_date_str, end_date_str)
    observations = content_classifier.generate_weekly_observations(weekly_data)

    report = {
        "user_id": user_id,
        "user_name": current_user.get("name", "User"),
        "start_date": start_date_str,
        "end_date": end_date_str,
        "total_items_analyzed": weekly_data["total_items_analyzed"],
        "total_time_seconds": weekly_data["total_time_seconds"],
        "total_time_formatted": weekly_data["total_time_formatted"],
        "weekly_distribution": weekly_data["weekly_distribution"],
        "category_time_distribution": weekly_data["category_time_distribution"],
        "timeline": weekly_data["timeline"],
        "correlation_points": weekly_data["correlation_points"],
        "ai_observations": observations,
        "disclaimer": "Digital consumption analytics reflect environmental media exposure and should not be construed as a psychiatric assessment."
    }

    return 200, report


def handle_mood_checkin(body: Dict[str, Any], current_user: Optional[Dict[str, Any]]) -> Tuple[int, Dict[str, Any]]:
    """Records the user's self-reported mood for the day ('How did you feel today?')."""
    if not current_user:
        return 401, {"detail": "Authentication required."}

    mood = body.get("mood", "").lower().strip()
    if mood not in MOOD_SCORE_MAP:
        valid_moods = list(MOOD_SCORE_MAP.keys())
        return 400, {"detail": f"Invalid mood. Choose from: {valid_moods}"}

    mood_score = MOOD_SCORE_MAP[mood]
    note = body.get("note", "").strip()
    checkin_date = body.get("date") or datetime.now().strftime("%Y-%m-%d")

    checkin_id = DatabaseService.save_or_update_mood_checkin(
        user_id=current_user["user_id"],
        mood=mood,
        mood_score=mood_score,
        note=note,
        checkin_date=checkin_date
    )

    return 200, {
        "status": "success",
        "checkin_id": checkin_id,
        "mood": mood,
        "mood_score": mood_score,
        "date": checkin_date,
        "note": note,
        "message": "Mood check-in recorded successfully."
    }


def handle_get_mood_history(query_params: Dict[str, Any], current_user: Optional[Dict[str, Any]]) -> Tuple[int, Dict[str, Any]]:
    """Retrieves recent mood check-ins."""
    if not current_user:
        return 401, {"detail": "Authentication required."}

    days = int(query_params.get("days", [14])[0])
    history = DatabaseService.get_mood_history(current_user["user_id"], days=days)
    return 200, {"total": len(history), "history": history}


def handle_classify_content(body: Dict[str, Any]) -> Tuple[int, Dict[str, Any]]:
    """Standalone content classifier for manual testing or API consumers."""
    text = body.get("text", "")
    title = body.get("title", "")
    domain = body.get("domain", "")
    url = body.get("url", "")

    if not text and not title:
        return 400, {"detail": "Text or title required."}

    res = content_classifier.classify(text=text, title=title, domain=domain, url=url)
    return 200, res


def handle_clear_consumption(current_user: Optional[Dict[str, Any]]) -> Tuple[int, Dict[str, Any]]:
    """Purges the user's consumption logs and mood check-ins (GDPR right to erasure)."""
    if not current_user:
        return 401, {"detail": "Authentication required."}

    DatabaseService.clear_consumption_logs(current_user["user_id"])
    return 200, {"message": "All digital consumption logs and mood check-ins cleared successfully."}
