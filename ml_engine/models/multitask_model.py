"""
Cognivibe AI - Multitask NLP Model Architecture (Calibrated)
Task 1: Emotion Classification (7 classes)
Task 2: Depression-Related Language & Indicator Classification (6 classes)
"""

import math
import re
from typing import Dict, List, Any, Tuple


EMOTION_CLASSES = [
    "Sadness",
    "Anger",
    "Joy",
    "Fear",
    "Neutral",
    "Anxiety/Worry",
    "Disgust"
]

DEPRESSION_INDICATOR_CLASSES = [
    "none",
    "loneliness",
    "hopelessness",
    "emotional_exhaustion",
    "negative_self_perception",
    "loss_of_interest"
]

DEPRESSIVE_EMOTIONS = {"Sadness"}


class MultitaskTextEngine:
    """Production-grade Multitask Classifier designed for code-mixed Hinglish."""

    def __init__(self):
        self.emotion_classes = EMOTION_CLASSES
        self.depression_classes = DEPRESSION_INDICATOR_CLASSES
        self.vocab: Dict[str, int] = {}
        self.idf: Dict[str, float] = {}
        self.emotion_centroids: Dict[str, Dict[str, float]] = {}
        self.depression_centroids: Dict[str, Dict[str, float]] = {}
        self.trained = False

    def _extract_features(self, text: str) -> List[str]:
        words = re.findall(r'\b[a-zA-Z0-9_\u0900-\u097F]+\b', text.lower())
        features = list(words)
        for w in words:
            if len(w) >= 3:
                w_padded = f"<{w}>"
                for n in (3, 4):
                    if len(w_padded) >= n:
                        for i in range(len(w_padded) - n + 1):
                            features.append(w_padded[i:i + n])
        return features

    def fit(self, samples: List[Dict[str, Any]]):
        doc_count = len(samples)
        doc_freq: Dict[str, int] = {}

        for item in samples:
            features = set(self._extract_features(item["text"]))
            for f in features:
                doc_freq[f] = doc_freq.get(f, 0) + 1

        self.vocab = {f: idx for idx, f in enumerate(doc_freq.keys())}
        self.idf = {
            f: math.log((1.0 + doc_count) / (1.0 + freq)) + 1.0
            for f, freq in doc_freq.items()
        }

        emotion_accum: Dict[str, Dict[str, float]] = {c: {} for c in self.emotion_classes}
        emotion_counts: Dict[str, int] = {c: 0 for c in self.emotion_classes}

        depression_accum: Dict[str, Dict[str, float]] = {c: {} for c in self.depression_classes}
        depression_counts: Dict[str, int] = {c: 0 for c in self.depression_classes}

        for item in samples:
            vec = self._vectorize(item["text"])
            emo = item.get("emotion")
            dep_ind = item.get("indicator", "none")

            if emo in emotion_accum:
                emotion_counts[emo] += 1
                for f, val in vec.items():
                    emotion_accum[emo][f] = emotion_accum[emo].get(f, 0.0) + val

            if dep_ind in depression_accum:
                depression_counts[dep_ind] += 1
                for f, val in vec.items():
                    depression_accum[dep_ind][f] = depression_accum[dep_ind].get(f, 0.0) + val

        for emo in self.emotion_classes:
            cnt = max(emotion_counts[emo], 1)
            self.emotion_centroids[emo] = self._normalize_vec({f: v / cnt for f, v in emotion_accum[emo].items()})

        for dep in self.depression_classes:
            cnt = max(depression_counts[dep], 1)
            self.depression_centroids[dep] = self._normalize_vec({f: v / cnt for f, v in depression_accum[dep].items()})

        self.trained = True

    def _vectorize(self, text: str) -> Dict[str, float]:
        features = self._extract_features(text)
        if not features:
            return {}

        tf: Dict[str, int] = {}
        for f in features:
            tf[f] = tf.get(f, 0) + 1

        vec: Dict[str, float] = {}
        for f, count in tf.items():
            if f in self.idf:
                sub_tf = 1.0 + math.log(count)
                vec[f] = sub_tf * self.idf[f]

        return self._normalize_vec(vec)

    def _normalize_vec(self, vec: Dict[str, float]) -> Dict[str, float]:
        sum_sq = sum(v * v for v in vec.values())
        norm = math.sqrt(sum_sq)
        if norm > 0:
            return {k: v / norm for k, v in vec.items()}
        return vec

    def _cosine_similarity(self, vec_a: Dict[str, float], vec_b: Dict[str, float]) -> float:
        score = 0.0
        for k, val in vec_a.items():
            if k in vec_b:
                score += val * vec_b[k]
        return max(0.0, score)

    def _softmax(self, scores: Dict[str, float], temperature: float = 0.08) -> Dict[str, float]:
        max_s = max(scores.values()) if scores else 0.0
        exp_vals = {k: math.exp((v - max_s) / max(temperature, 0.005)) for k, v in scores.items()}
        total_exp = sum(exp_vals.values())
        if total_exp == 0:
            count = len(scores)
            return {k: 1.0 / count for k in scores}
        return {k: round(v / total_exp, 4) for k, v in exp_vals.items()}

    def _calculate_entropy(self, probabilities: Dict[str, float]) -> float:
        n = len(probabilities)
        if n <= 1:
            return 0.0
        max_entropy = math.log2(n)
        h = 0.0
        for p in probabilities.values():
            if p > 1e-7:
                h -= p * math.log2(p)
        return round(min(1.0, max(0.0, h / max_entropy)), 4)

    def predict(self, normalized_text: str) -> Dict[str, Any]:
        if not self.trained:
            raise RuntimeError("MultitaskTextEngine has not been trained yet.")

        vec = self._vectorize(normalized_text)

        # Head 1: Emotion
        emotion_scores: Dict[str, float] = {}
        for emo in self.emotion_classes:
            centroid = self.emotion_centroids.get(emo, {})
            emotion_scores[emo] = self._cosine_similarity(vec, centroid)

        emotion_probs = self._softmax(emotion_scores, temperature=0.08)
        best_emotion = max(emotion_probs, key=emotion_probs.get)
        emotion_confidence = emotion_probs[best_emotion]
        emotion_entropy = self._calculate_entropy(emotion_probs)

        # Head 2: Depression Indicator
        depression_scores: Dict[str, float] = {}
        for dep in self.depression_classes:
            centroid = self.depression_centroids.get(dep, {})
            sim = self._cosine_similarity(vec, centroid)
            depression_scores[dep] = sim

        # If predicted emotion is clearly positive (Joy) or neutral everyday, boost 'none'
        if best_emotion in {"Joy", "Neutral", "Anger", "Disgust"}:
            depression_scores["none"] = depression_scores.get("none", 0.0) + 0.15

        depression_probs = self._softmax(depression_scores, temperature=0.08)
        best_indicator = max(depression_probs, key=depression_probs.get)
        indicator_confidence = depression_probs[best_indicator]
        depression_entropy = self._calculate_entropy(depression_probs)

        # Binary label: true if best indicator is not 'none' and emotion aligns with distress
        prob_depressive = round(1.0 - depression_probs.get("none", 0.5), 4)
        is_depression_related = int(best_indicator != "none" and prob_depressive >= 0.50)

        combined_uncertainty = round((emotion_entropy + depression_entropy) / 2.0, 4)
        is_uncertain = (combined_uncertainty > 0.85 or emotion_confidence < 0.30)

        return {
            "emotion": best_emotion,
            "emotion_confidence": emotion_confidence,
            "emotion_probabilities": emotion_probs,
            "emotion_entropy": emotion_entropy,
            "depression_related": is_depression_related,
            "depression_probability": prob_depressive,
            "depression_indicator": best_indicator if is_depression_related else "none",
            "depression_indicator_confidence": indicator_confidence,
            "depression_probabilities": depression_probs,
            "depression_entropy": depression_entropy,
            "uncertainty_score": combined_uncertainty,
            "is_uncertain": is_uncertain,
            "status": "inconclusive" if is_uncertain else "confident"
        }
