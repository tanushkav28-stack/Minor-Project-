"""
Cognivibe AI - Dashboard Analytics API Endpoints
Aggregates user metrics, emotional trends, depression language distribution, and benchmark data.
"""

import json
import os
from typing import Dict, Any, Tuple, Optional
from backend.app.database.session import DatabaseService


def handle_get_summary(current_user: Optional[Dict[str, Any]]) -> Tuple[int, Dict[str, Any]]:
    if not current_user:
        return 401, {"detail": "Authentication required."}

    summary = DatabaseService.get_dashboard_summary(current_user["user_id"])
    return 200, summary


def handle_get_trends(current_user: Optional[Dict[str, Any]], days: int = 14) -> Tuple[int, Dict[str, Any]]:
    if not current_user:
        return 401, {"detail": "Authentication required."}

    history = DatabaseService.get_analysis_history(current_user["user_id"], limit=100)
    
    # Group by date
    timeline: Dict[str, Dict[str, Any]] = {}
    for h in reversed(history):
        raw_date = h.get("created_at", "")[:10] or "2026-11-05"
        if raw_date not in timeline:
            timeline[raw_date] = {
                "date": raw_date,
                "total_analyses": 0,
                "depression_signals": 0,
                "joy_signals": 0,
                "anxiety_signals": 0,
                "sadness_signals": 0
            }
        timeline[raw_date]["total_analyses"] += 1
        if h.get("depression_related") == 1:
            timeline[raw_date]["depression_signals"] += 1
        emo = h.get("predicted_emotion")
        if emo == "Joy":
            timeline[raw_date]["joy_signals"] += 1
        elif emo == "Anxiety/Worry":
            timeline[raw_date]["anxiety_signals"] += 1
        elif emo == "Sadness":
            timeline[raw_date]["sadness_signals"] += 1

    trend_series = list(timeline.values())
    return 200, {
        "days": days,
        "timeline": trend_series
    }


def handle_get_benchmarks() -> Tuple[int, Dict[str, Any]]:
    """Returns actual baseline comparison and evaluation metrics for academic evaluation."""
    results_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "ml_engine", "evaluation", "experiment_results.json")
    if os.path.exists(results_path):
        with open(results_path, "r", encoding="utf-8") as f:
            return 200, json.load(f)
    return 200, {
        "status": "pending_experiments",
        "message": "Run ml_engine/training/train_all.py to generate experimental metrics."
    }

