"""
Cognivibe AI - Real-Time Inference Engine
Handles:
1. Code-mixed Hinglish text normalization
2. Multitask inference (Emotion + Depression Language + Specific Indicator)
3. Calibrated uncertainty estimation
4. Context-aware sequential pattern analysis
5. Sensitive Crisis Intervention & Helpline referral
6. Ethical and clinical non-diagnostic disclaimers
"""

import json
import os
import sys
from typing import Dict, List, Any, Optional

# Ensure root in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from ml_engine.preprocessing.hinglish_normalizer import normalizer
from ml_engine.models.multitask_model import (
    MultitaskTextEngine,
    EMOTION_CLASSES,
    DEPRESSION_INDICATOR_CLASSES
)
from ml_engine.models.context_encoder import context_analyzer


# Emergency supportive resources for India & International
SUPPORTIVE_RESOURCES = {
    "disclaimer": (
        "IMPORTANT NOTICE: Cognivibe AI is an assistive research screening tool for linguistic pattern analysis. "
        "It is NOT a medical device, clinical diagnostic instrument, or psychological evaluation. "
        "If you or someone you know is feeling overwhelmed, hopeless, or having thoughts of self-harm, "
        "please reach out to trusted professionals or call these confidential 24x7 helplines:"
    ),
    "helplines": [
        {"name": "Tele-MANAS (Govt of India)", "number": "14416 / 1800-891-4416", "available": "24x7 Free & Confidential"},
        {"name": "KIRAN Mental Health Helpline", "number": "1800-599-0019", "available": "24x7 Multi-lingual"},
        {"name": "Vandrevala Foundation Helpline", "number": "+91 9999 666 555", "available": "24x7 Free Counseling"},
        {"name": "AASRA Helpline", "number": "+91 98204 66726", "available": "24x7 Suicide Prevention"},
        {"name": "International Crisis Text Line", "number": "Text HOME to 741741", "available": "Global / US / UK / CA"}
    ]
}


class CognivibePredictor:
    """Production Inference Engine for Cognivibe AI."""

    def __init__(self):
        self.engine = MultitaskTextEngine()
        self._load_or_train()

    def _load_or_train(self):
        weights_path = os.path.join(os.path.dirname(__file__), "..", "saved_models", "multitask_weights.json")
        if os.path.exists(weights_path):
            with open(weights_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            self.engine.vocab = data["vocab"]
            self.engine.idf = data["idf"]
            self.engine.emotion_centroids = data["emotion_centroids"]
            self.engine.depression_centroids = data["depression_centroids"]
            self.engine.emotion_priors = {c: 1.0 / len(EMOTION_CLASSES) for c in EMOTION_CLASSES}
            self.engine.depression_priors = {c: 1.0 / len(DEPRESSION_INDICATOR_CLASSES) for c in DEPRESSION_INDICATOR_CLASSES}
            self.engine.trained = True
        else:
            # Train on the fly
            from ml_engine.data.build_dataset import generate_dataset
            dataset_path = os.path.join(os.path.dirname(__file__), "..", "data", "processed", "code_mixed_dataset.json")
            if not os.path.exists(dataset_path):
                generate_dataset()
            with open(dataset_path, "r", encoding="utf-8") as f:
                samples = json.load(f)
            # Normalize samples
            prepped = []
            for s in samples:
                norm_t, _ = normalizer.normalize(s["text"])
                prepped.append({
                    "text": norm_t,
                    "emotion": s["emotion"],
                    "indicator": s["indicator"]
                })
            self.engine.fit(prepped)

    def extract_linguistic_cues(self, text: str, norm_text: str, prediction: Dict[str, Any]) -> List[str]:
        """Identifies salient emotional keywords and Hinglish markers explaining the prediction."""
        cues = []
        lower = text.lower()

        # Check emotional cues
        key_markers = {
            "akelapan": "Romanized Hindi indicator for persistent loneliness ('akelapan')",
            "akela": "Expression of isolation ('akela')",
            "overwhelming": "Cognitive overload / emotional exhaustion cue",
            "dark": "Hopelessness / bleak outlook imagery",
            "ummeed": "Loss of hope / expectation ('ummeed')",
            "umeed": "Loss of hope / expectation ('umeed')",
            "numb": "Anhedonia / loss of emotional sensitivity",
            "burden": "Negative self-perception / self-blame expression ('burden')",
            "ghin": "Self-directed disgust / worthlessness expression",
            "thak": "Exhaustion / chronic fatigue marker ('thak chuka/chuki')",
            "exhausted": "Exhaustion marker",
            "dard": "Psychological ache / suffering marker ('dard')",
            "nervousness": "Situational physiological anxiety indicator",
            "khush": "Positive affect / joy marker ('khush')",
            "sukoon": "Serenity / peace marker ('sukoon')",
            "gussa": "Frustration / anger marker ('gussa')"
        }

        for marker, explanation in key_markers.items():
            if marker in lower or marker in norm_text:
                cues.append(explanation)

        if not cues:
            cues.append(f"Syntactic patterns and vocabulary aligned with '{prediction['emotion']}' affect.")

        return cues[:4]

    def analyze(self, text: str, history: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """
        Executes end-to-end analysis:
        1. Normalization
        2. Multitask inference
        3. Linguistic cues extraction
        4. Context-aware trajectory analysis
        5. Safety check
        """
        if not text or not text.strip():
            return {
                "error": "Empty text provided for analysis.",
                "status": "invalid"
            }

        # 1. Normalization
        norm_text, meta = normalizer.normalize(text)

        # 2. Multitask prediction
        raw_pred = self.engine.predict(norm_text)

        # 3. Linguistic cues
        cues = self.extract_linguistic_cues(text, norm_text, raw_pred)

        # 4. Context-aware evaluation
        context_eval = context_analyzer.analyze_trajectory(raw_pred, history or [])

        # 5. Safety check
        is_crisis = meta.get("crisis_flag", False)

        # Build response
        response = {
            "input_text": text,
            "normalized_text": norm_text,
            "metadata": {
                "is_code_mixed": meta.get("is_hinglish", False),
                "devanagari_ratio": meta.get("scripts", {}).get("devanagari_ratio", 0.0),
                "latin_ratio": meta.get("scripts", {}).get("latin_ratio", 1.0),
                "crisis_flag": is_crisis
            },
            "task_1_emotion": {
                "predicted_emotion": raw_pred["emotion"],
                "confidence": raw_pred["emotion_confidence"],
                "entropy": raw_pred["emotion_entropy"],
                "all_probabilities": raw_pred["emotion_probabilities"]
            },
            "task_2_depression_language": {
                "depression_related": bool(raw_pred["depression_related"]),
                "probability": raw_pred["depression_probability"],
                "indicator": raw_pred["depression_indicator"],
                "indicator_confidence": raw_pred["depression_indicator_confidence"],
                "all_probabilities": raw_pred["depression_probabilities"]
            },
            "uncertainty": {
                "score": raw_pred["uncertainty_score"],
                "is_uncertain": raw_pred["is_uncertain"],
                "status": raw_pred["status"],
                "explanation": (
                    "Low confidence / ambiguous linguistic signals. Result should be treated with caution."
                    if raw_pred["is_uncertain"] else "High model agreement on linguistic features."
                )
            },
            "context_analysis": context_eval,
            "linguistic_cues": cues,
            "ethical_disclaimer": SUPPORTIVE_RESOURCES["disclaimer"],
            "supportive_resources": SUPPORTIVE_RESOURCES["helplines"] if (is_crisis or raw_pred["depression_related"] == 1) else []
        }

        return response


# Global singleton predictor instance
predictor = CognivibePredictor()

