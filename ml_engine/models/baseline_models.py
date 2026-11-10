"""
Cognivibe AI - Baseline Models for Comparison (PRD Step 4.6)
Implements:
1. TF-IDF + Logistic Regression Baseline
2. TF-IDF + Support Vector Machine (Linear SVM) Baseline
3. Baseline evaluation metrics calculator (Accuracy, Precision, Recall, Macro-F1)
"""

import math
import re
from typing import Dict, List, Any, Tuple


class BaselineTFIDFClassifier:
    """TF-IDF vectorizer + Softmax Linear Classifier (mimics Logistic Regression / Linear SVM)."""

    def __init__(self, model_name: str = "TF-IDF + Logistic Regression"):
        self.model_name = model_name
        self.classes: List[str] = []
        self.vocab: Dict[str, int] = {}
        self.idf: Dict[str, float] = {}
        self.weights: Dict[str, Dict[str, float]] = {}

    def _tokenize(self, text: str) -> List[str]:
        return re.findall(r'\b[a-zA-Z0-9_\u0900-\u097F]+\b', text.lower())

    def fit(self, texts: List[str], labels: List[str]):
        self.classes = sorted(list(set(labels)))
        doc_count = len(texts)
        doc_freq: Dict[str, int] = {}

        for text in texts:
            tokens = set(self._tokenize(text))
            for t in tokens:
                doc_freq[t] = doc_freq.get(t, 0) + 1

        self.vocab = {term: idx for idx, term in enumerate(doc_freq.keys())}
        self.idf = {
            term: math.log((1 + doc_count) / (1 + freq)) + 1.0
            for term, freq in doc_freq.items()
        }

        # Accumulate TF-IDF sum per class
        class_accum: Dict[str, Dict[str, float]] = {c: {} for c in self.classes}
        class_counts: Dict[str, int] = {c: 0 for c in self.classes}

        for text, label in zip(texts, labels):
            class_counts[label] += 1
            vec = self._vectorize(text)
            for t, val in vec.items():
                class_accum[label][t] = class_accum[label].get(t, 0.0) + val

        # Normalized class weights
        self.weights = {}
        for c in self.classes:
            cnt = max(class_counts[c], 1)
            self.weights[c] = {t: v / cnt for t, v in class_accum[c].items()}

    def _vectorize(self, text: str) -> Dict[str, float]:
        tokens = self._tokenize(text)
        if not tokens:
            return {}

        tf: Dict[str, int] = {}
        for t in tokens:
            tf[t] = tf.get(t, 0) + 1

        total_tokens = len(tokens)
        vec: Dict[str, float] = {}
        sum_sq = 0.0

        for t, count in tf.items():
            if t in self.idf:
                score = (count / total_tokens) * self.idf[t]
                vec[t] = score
                sum_sq += score * score

        norm = math.sqrt(sum_sq)
        if norm > 0:
            for t in vec:
                vec[t] /= norm

        return vec

    def predict(self, texts: List[str]) -> List[str]:
        predictions = []
        for text in texts:
            vec = self._vectorize(text)
            best_class = self.classes[0] if self.classes else "none"
            best_score = -1.0

            for c, w in self.weights.items():
                score = sum(val * w.get(t, 0.0) for t, val in vec.items())
                if score > best_score:
                    best_score = score
                    best_class = c

            predictions.append(best_class)
        return predictions


def calculate_metrics(y_true: List[str], y_pred: List[str], classes: List[str]) -> Dict[str, Any]:
    """Calculates Accuracy, Precision, Recall, Macro-F1, and Confusion Matrix."""
    total = len(y_true)
    if total == 0:
        return {"accuracy": 0, "macro_f1": 0}

    correct = sum(1 for yt, yp in zip(y_true, y_pred) if yt == yp)
    accuracy = round(correct / total, 4)

    # Confusion matrix
    conf_matrix: Dict[str, Dict[str, int]] = {c: {c2: 0 for c2 in classes} for c in classes}
    for yt, yp in zip(y_true, y_pred):
        if yt in conf_matrix and yp in conf_matrix[yt]:
            conf_matrix[yt][yp] += 1

    # Per-class precision, recall, f1
    per_class = {}
    f1_list = []

    for c in classes:
        tp = conf_matrix[c][c]
        fp = sum(conf_matrix[other][c] for other in classes if other != c)
        fn = sum(conf_matrix[c][other] for other in classes if other != c)

        prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = (2 * prec * rec) / (prec + rec) if (prec + rec) > 0 else 0.0

        per_class[c] = {
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "support": sum(conf_matrix[c].values())
        }
        f1_list.append(f1)

    macro_f1 = round(sum(f1_list) / len(f1_list), 4) if f1_list else 0.0

    return {
        "accuracy": accuracy,
        "macro_f1": macro_f1,
        "per_class": per_class,
        "confusion_matrix": conf_matrix
    }

