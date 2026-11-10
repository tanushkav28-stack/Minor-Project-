"""
Cognivibe AI - Context-Aware Sequential Aggregator
Handles longitudinal context-aware analysis of user expressions across social media turns.
Differentiates between:
1. Isolated, temporary situational sadness (e.g., losing a match, bad day).
2. Recurring, chronic linguistic patterns of depression (e.g., persistent hopelessness, isolation, self-blame).
"""

from typing import List, Dict, Any
from datetime import datetime


class ContextAwareAnalyzer:
    """Aggregates user post history to detect temporal patterns and emotional trajectory."""

    def __init__(self, persistence_threshold: float = 0.55):
        self.persistence_threshold = persistence_threshold

    def analyze_trajectory(self, current_prediction: Dict[str, Any], history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Takes current sample prediction and a list of previous historical predictions:
        history items format: { "text": str, "timestamp": str, "emotion": str, "depression_related": int, "indicator": str }
        """
        if not history:
            return {
                "context_applied": False,
                "history_length": 0,
                "chronic_risk_flag": False,
                "trajectory": "insufficient_context",
                "persistence_ratio": 0.0,
                "contextual_adjustment": "No prior posts available for context evaluation.",
                "emotion_stability": 1.0
            }

        # Combine history with current
        all_turns = list(history)
        all_turns.append({
            "emotion": current_prediction.get("emotion"),
            "depression_related": current_prediction.get("depression_related", 0),
            "indicator": current_prediction.get("indicator", "none")
        })

        total_turns = len(all_turns)
        depressive_turns = sum(1 for t in all_turns if t.get("depression_related") == 1)
        persistence_ratio = round(depressive_turns / total_turns, 3)

        # Check emotion variability
        emotions = [t.get("emotion") for t in all_turns if t.get("emotion")]
        unique_emotions = set(emotions)
        emotion_stability = round(1.0 - (len(unique_emotions) / max(total_turns, 1)), 2)

        # Indicator recurrence
        indicators = [t.get("indicator") for t in all_turns if t.get("indicator") and t.get("indicator") != "none"]
        dominant_indicator = max(set(indicators), key=indicators.count) if indicators else "none"

        # Trajectory analysis
        is_isolated = (persistence_ratio <= 0.34 and total_turns >= 3)
        is_chronic = (persistence_ratio >= self.persistence_threshold and total_turns >= 2)

        if is_chronic:
            trajectory = "chronic_persistent_negative"
            contextual_adjustment = (
                f"Context indicates recurring patterns of negative language across {depressive_turns}/{total_turns} "
                f"recent expressions, predominantly signaling '{dominant_indicator}'."
            )
            chronic_risk_flag = True
        elif is_isolated and current_prediction.get("depression_related") == 1:
            trajectory = "isolated_event_or_transient"
            contextual_adjustment = (
                "Historical posts reflect predominantly neutral/positive baseline. "
                "Current negative expression appears situational rather than persistent."
            )
            chronic_risk_flag = False
        else:
            trajectory = "mixed_fluctuating"
            contextual_adjustment = (
                f"Emotional expressions show fluctuation over time ({len(unique_emotions)} distinct emotions observed)."
            )
            chronic_risk_flag = False

        return {
            "context_applied": True,
            "history_length": len(history),
            "total_evaluated_turns": total_turns,
            "chronic_risk_flag": chronic_risk_flag,
            "trajectory": trajectory,
            "persistence_ratio": persistence_ratio,
            "dominant_indicator": dominant_indicator,
            "emotion_stability": emotion_stability,
            "contextual_adjustment": contextual_adjustment
        }


context_analyzer = ContextAwareAnalyzer()

