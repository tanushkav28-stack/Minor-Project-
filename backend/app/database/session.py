"""
Cognivibe AI - Database Session Manager & Data Access Layer
Supports SQLite and PostgreSQL. Provides clean helper methods for all API operations.
"""

import sqlite3
import os
import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from backend.app.core.config import settings
from backend.app.database.models import SCHEMA_SQL


DB_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "cognivibe.db"))


def get_db_connection():
    """Returns a SQLite connection with dict-like row factory and foreign keys enabled."""
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db():
    """Initializes the database schema and indexes."""
    conn = get_db_connection()
    with conn:
        conn.executescript(SCHEMA_SQL)
    conn.close()
    print("Database tables initialized successfully.")


class DatabaseService:
    """Encapsulates all database operations for Users, Analysis, Consent, and Reports."""

    # ------------------ USERS ------------------
    @staticmethod
    def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email.lower().strip(),))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT user_id, name, email, extension_token, created_at FROM users WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def get_user_by_extension_token(token: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE extension_token = ?", (token.strip(),))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def create_user(name: str, email: str, password_hash: str) -> Dict[str, Any]:
        user_id = f"usr_{uuid.uuid4().hex[:12]}"
        extension_token = f"ext_{uuid.uuid4().hex[:20]}"
        now = datetime.now().isoformat()

        conn = get_db_connection()
        with conn:
            conn.execute(
                "INSERT INTO users (user_id, name, email, password_hash, extension_token, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (user_id, name.strip(), email.lower().strip(), password_hash, extension_token, now)
            )
            consent_id = f"cst_{uuid.uuid4().hex[:12]}"
            conn.execute(
                "INSERT INTO user_consent (consent_id, user_id, consent_type, consent_status, retention_days, allow_extension_analysis, updated_at) VALUES (?, ?, 'full_analysis', 1, 30, 1, ?)",
                (consent_id, user_id, now)
            )
        conn.close()
        return {
            "user_id": user_id,
            "name": name,
            "email": email,
            "extension_token": extension_token,
            "created_at": now
        }

    @staticmethod
    def update_user_profile(user_id: str, name: str) -> bool:
        conn = get_db_connection()
        with conn:
            conn.execute("UPDATE users SET name = ? WHERE user_id = ?", (name.strip(), user_id))
        conn.close()
        return True

    @staticmethod
    def delete_user_account(user_id: str) -> bool:
        conn = get_db_connection()
        with conn:
            conn.execute("DELETE FROM users WHERE user_id = ?", (user_id,))
        conn.close()
        return True

    # ------------------ CONSENT & PRIVACY ------------------
    @staticmethod
    def get_user_consent(user_id: str) -> Dict[str, Any]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user_consent WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        conn.close()
        if row:
            return dict(row)
        return {
            "consent_status": 1,
            "retention_days": 30,
            "allow_extension_analysis": 1
        }

    @staticmethod
    def update_user_consent(user_id: str, consent_status: int, retention_days: int, allow_extension: int) -> bool:
        conn = get_db_connection()
        with conn:
            conn.execute(
                "UPDATE user_consent SET consent_status = ?, retention_days = ?, allow_extension_analysis = ?, updated_at = ? WHERE user_id = ?",
                (consent_status, retention_days, allow_extension, datetime.now().isoformat(), user_id)
            )
        conn.close()
        return True

    # ------------------ ANALYSIS & PREDICTIONS ------------------
    @staticmethod
    def save_analysis(user_id: str, source_type: str, analysis_result: Dict[str, Any]) -> str:
        analysis_id = f"anl_{uuid.uuid4().hex[:12]}"
        now = datetime.now().isoformat()

        input_text = analysis_result.get("input_text", "")
        norm_text = analysis_result.get("normalized_text", "")
        is_code_mixed = int(analysis_result.get("metadata", {}).get("is_code_mixed", False))
        uncertainty = analysis_result.get("uncertainty", {}).get("score", 0.0)
        is_uncertain = int(analysis_result.get("uncertainty", {}).get("is_uncertain", False))

        emo = analysis_result.get("task_1_emotion", {})
        dep = analysis_result.get("task_2_depression_language", {})
        is_crisis = int(analysis_result.get("metadata", {}).get("crisis_flag", False))

        conn = get_db_connection()
        with conn:
            # 1. Analysis history record
            conn.execute(
                """INSERT INTO analysis_history 
                   (analysis_id, user_id, source_type, input_text, normalized_text, is_code_mixed, uncertainty_score, is_uncertain, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (analysis_id, user_id, source_type, input_text, norm_text, is_code_mixed, uncertainty, is_uncertain, now)
            )
            # 2. Emotion prediction
            conn.execute(
                """INSERT INTO emotion_predictions 
                   (prediction_id, analysis_id, predicted_emotion, confidence_score, probability_details)
                   VALUES (?, ?, ?, ?, ?)""",
                (f"emo_{uuid.uuid4().hex[:12]}", analysis_id, emo.get("predicted_emotion", "Neutral"),
                 emo.get("confidence", 0.0), json.dumps(emo.get("all_probabilities", {})))
            )
            # 3. Depression prediction
            conn.execute(
                """INSERT INTO depression_predictions 
                   (prediction_id, analysis_id, depression_related, predicted_indicator, confidence_score, probability_details, is_crisis)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (f"dep_{uuid.uuid4().hex[:12]}", analysis_id, int(dep.get("depression_related", False)),
                 dep.get("indicator", "none"), dep.get("indicator_confidence", 0.0),
                 json.dumps(dep.get("all_probabilities", {})), is_crisis)
            )
        conn.close()
        return analysis_id

    @staticmethod
    def get_analysis_history(user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = """
            SELECT a.analysis_id, a.user_id, a.source_type, a.input_text, a.normalized_text,
                   a.is_code_mixed, a.uncertainty_score, a.is_uncertain, a.created_at,
                   e.predicted_emotion, e.confidence_score AS emotion_confidence, e.probability_details AS emotion_probs,
                   d.depression_related, d.predicted_indicator, d.confidence_score AS dep_confidence, d.probability_details AS dep_probs, d.is_crisis
            FROM analysis_history a
            LEFT JOIN emotion_predictions e ON a.analysis_id = e.analysis_id
            LEFT JOIN depression_predictions d ON a.analysis_id = d.analysis_id
            WHERE a.user_id = ?
            ORDER BY a.created_at DESC
            LIMIT ?
        """
        cursor.execute(query, (user_id, limit))
        rows = cursor.fetchall()
        conn.close()

        records = []
        for r in rows:
            d_row = dict(r)
            try:
                d_row["emotion_probs"] = json.loads(d_row.get("emotion_probs", "{}"))
            except Exception:
                d_row["emotion_probs"] = {}
            try:
                d_row["dep_probs"] = json.loads(d_row.get("dep_probs", "{}"))
            except Exception:
                d_row["dep_probs"] = {}
            records.append(d_row)

        return records

    @staticmethod
    def delete_single_analysis(user_id: str, analysis_id: str) -> bool:
        conn = get_db_connection()
        with conn:
            conn.execute("DELETE FROM analysis_history WHERE analysis_id = ? AND user_id = ?", (analysis_id, user_id))
        conn.close()
        return True

    @staticmethod
    def clear_user_history(user_id: str) -> bool:
        conn = get_db_connection()
        with conn:
            conn.execute("DELETE FROM analysis_history WHERE user_id = ?", (user_id,))
        conn.close()
        return True

    # ------------------ DASHBOARD AGGREGATES ------------------
    @staticmethod
    def get_dashboard_summary(user_id: str) -> Dict[str, Any]:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Total analyses
        cursor.execute("SELECT COUNT(*) as total, AVG(uncertainty_score) as avg_unc FROM analysis_history WHERE user_id = ?", (user_id,))
        stat = cursor.fetchone()
        total_analyses = stat["total"] if stat else 0
        avg_uncertainty = round(stat["avg_unc"] or 0.0, 3) if stat else 0.0

        # Emotion distribution
        cursor.execute("""
            SELECT e.predicted_emotion, COUNT(*) as count 
            FROM emotion_predictions e
            JOIN analysis_history a ON e.analysis_id = a.analysis_id
            WHERE a.user_id = ?
            GROUP BY e.predicted_emotion
        """, (user_id,))
        emotion_counts = {row["predicted_emotion"]: row["count"] for row in cursor.fetchall()}

        # Depression distribution
        cursor.execute("""
            SELECT d.depression_related, d.predicted_indicator, COUNT(*) as count
            FROM depression_predictions d
            JOIN analysis_history a ON d.analysis_id = a.analysis_id
            WHERE a.user_id = ?
            GROUP BY d.depression_related, d.predicted_indicator
        """, (user_id,))
        dep_rows = cursor.fetchall()
        dep_total = sum(r["count"] for r in dep_rows if r["depression_related"] == 1)
        indicator_counts = {r["predicted_indicator"]: r["count"] for r in dep_rows if r["predicted_indicator"] != "none"}

        # Sources
        cursor.execute("SELECT source_type, COUNT(*) as count FROM analysis_history WHERE user_id = ? GROUP BY source_type", (user_id,))
        sources = {r["source_type"]: r["count"] for r in cursor.fetchall()}

        conn.close()

        return {
            "total_analyses": total_analyses,
            "avg_uncertainty": avg_uncertainty,
            "depression_language_count": dep_total,
            "depression_percentage": round((dep_total / max(total_analyses, 1)) * 100, 1),
            "emotion_distribution": emotion_counts,
            "indicator_distribution": indicator_counts,
            "source_distribution": sources
        }

    # ------------------ REPORTS ------------------
    @staticmethod
    def save_report(user_id: str, title: str, report_type: str, summary_data: Dict[str, Any]) -> str:
        report_id = f"rep_{uuid.uuid4().hex[:12]}"
        now = datetime.now().isoformat()
        conn = get_db_connection()
        with conn:
            conn.execute(
                "INSERT INTO reports (report_id, user_id, title, report_type, generated_at, summary_json) VALUES (?, ?, ?, ?, ?, ?)",
                (report_id, user_id, title, report_type, now, json.dumps(summary_data))
            )
        conn.close()
        return report_id

    @staticmethod
    def get_user_reports(user_id: str) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT report_id, user_id, title, report_type, generated_at, summary_json FROM reports WHERE user_id = ? ORDER BY generated_at DESC", (user_id,))
        rows = cursor.fetchall()
        conn.close()
        reports = []
        for r in rows:
            d = dict(r)
            try:
                d["summary_data"] = json.loads(d.get("summary_json", "{}"))
            except Exception:
                d["summary_data"] = {}
            reports.append(d)
        return reports


# Initialize DB on import
init_db()

