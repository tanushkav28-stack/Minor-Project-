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

    @staticmethod
    def get_report_by_id(report_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT report_id, user_id, title, report_type, generated_at, summary_json FROM reports WHERE report_id = ? AND user_id = ?",
            (report_id, user_id)
        )
        row = cursor.fetchone()
        conn.close()
        if not row:
            return None
        d = dict(row)
        try:
            d["summary_data"] = json.loads(d.get("summary_json", "{}"))
        except Exception:
            d["summary_data"] = {}
        return d

    @staticmethod
    def delete_report(report_id: str, user_id: str) -> bool:
        conn = get_db_connection()
        with conn:
            cursor = conn.execute("DELETE FROM reports WHERE report_id = ? AND user_id = ?", (report_id, user_id))
            deleted = cursor.rowcount > 0
        conn.close()
        return deleted

    # ------------------ DIGITAL CONSUMPTION & MOOD INTELLIGENCE ------------------
    @staticmethod
    def save_consumption_log(user_id: str, data: Dict[str, Any]) -> str:
        log_id = f"csm_{uuid.uuid4().hex[:14]}"
        now = datetime.now()
        date_str = data.get("date") or now.strftime("%Y-%m-%d")
        iso_now = now.isoformat()

        conn = get_db_connection()
        with conn:
            conn.execute("""
                INSERT INTO consumption_logs (
                    log_id, user_id, url, domain, platform, category,
                    title, content_snippet, emotional_tone, topic,
                    emotional_intensity, is_distressing, distressing_theme,
                    constructiveness, time_spent_seconds, timestamp, date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                log_id,
                user_id,
                data.get("url", ""),
                data.get("domain", ""),
                data.get("platform", "Web"),
                data.get("category", "Other"),
                data.get("title", "Untitled Content"),
                data.get("content_snippet", "")[:1000],
                data.get("emotional_tone", "neutral"),
                data.get("topic", "General"),
                data.get("emotional_intensity", "medium"),
                1 if data.get("is_distressing") else 0,
                data.get("distressing_theme", "none"),
                data.get("constructiveness", "informative"),
                int(data.get("time_spent_seconds", 0)),
                iso_now,
                date_str
            ))
        conn.close()
        return log_id

    @staticmethod
    def save_consumption_logs_batch(user_id: str, items: List[Dict[str, Any]]) -> int:
        if not items:
            return 0
        conn = get_db_connection()
        count = 0
        now = datetime.now()
        iso_now = now.isoformat()
        with conn:
            for data in items:
                log_id = f"csm_{uuid.uuid4().hex[:14]}"
                date_str = data.get("date") or now.strftime("%Y-%m-%d")
                conn.execute("""
                    INSERT INTO consumption_logs (
                        log_id, user_id, url, domain, platform, category,
                        title, content_snippet, emotional_tone, topic,
                        emotional_intensity, is_distressing, distressing_theme,
                        constructiveness, time_spent_seconds, timestamp, date
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    log_id,
                    user_id,
                    data.get("url", ""),
                    data.get("domain", ""),
                    data.get("platform", "Web"),
                    data.get("category", "Other"),
                    data.get("title", "Untitled Content"),
                    data.get("content_snippet", "")[:1000],
                    data.get("emotional_tone", "neutral"),
                    data.get("topic", "General"),
                    data.get("emotional_intensity", "medium"),
                    1 if data.get("is_distressing") else 0,
                    data.get("distressing_theme", "none"),
                    data.get("constructiveness", "informative"),
                    int(data.get("time_spent_seconds", 0)),
                    iso_now,
                    date_str
                ))
                count += 1
        conn.close()
        return count

    @staticmethod
    def get_daily_consumption(user_id: str, target_date: str) -> Dict[str, Any]:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT * FROM consumption_logs 
            WHERE user_id = ? AND date = ? 
            ORDER BY timestamp DESC
        """, (user_id, target_date))
        rows = [dict(r) for r in cursor.fetchall()]

        cursor.execute("""
            SELECT * FROM mood_checkins 
            WHERE user_id = ? AND checkin_date = ? 
            ORDER BY created_at DESC LIMIT 1
        """, (user_id, target_date))
        mood_row = cursor.fetchone()
        mood_data = dict(mood_row) if mood_row else None

        conn.close()

        total_items = len(rows)
        total_time_seconds = sum(r.get("time_spent_seconds", 0) for r in rows)

        # Tone distribution
        tone_counts = {"positive": 0, "neutral": 0, "negative": 0, "mixed": 0}
        category_stats: Dict[str, Dict[str, Any]] = {}
        topic_counts: Dict[str, int] = {}
        intensity_counts = {"low": 0, "medium": 0, "high": 0}
        constructiveness_counts: Dict[str, int] = {}
        distressing_items = 0

        for r in rows:
            tone = r.get("emotional_tone", "neutral").lower()
            tone_counts[tone] = tone_counts.get(tone, 0) + 1

            cat = r.get("category") or "Other"
            if cat not in category_stats:
                category_stats[cat] = {"time_spent": 0, "count": 0}
            category_stats[cat]["time_spent"] += r.get("time_spent_seconds", 0)
            category_stats[cat]["count"] += 1

            top = r.get("topic") or "General"
            topic_counts[top] = topic_counts.get(top, 0) + 1

            inten = r.get("emotional_intensity", "medium").lower()
            intensity_counts[inten] = intensity_counts.get(inten, 0) + 1

            con = r.get("constructiveness", "informative").lower()
            constructiveness_counts[con] = constructiveness_counts.get(con, 0) + 1

            if r.get("is_distressing"):
                distressing_items += 1

        # Percentages
        denom = max(total_items, 1)
        emotional_distribution = {
            "positive_pct": round((tone_counts.get("positive", 0) / denom) * 100, 1),
            "neutral_pct": round((tone_counts.get("neutral", 0) / denom) * 100, 1),
            "negative_pct": round((tone_counts.get("negative", 0) / denom) * 100, 1),
            "mixed_pct": round((tone_counts.get("mixed", 0) / denom) * 100, 1),
            "raw_counts": tone_counts
        }

        # Categories list
        categories_list = []
        for cat_name, stats in category_stats.items():
            spent = stats["time_spent"]
            hrs = spent // 3600
            mins = (spent % 3600) // 60
            time_formatted = f"{hrs}h {mins}m" if hrs > 0 else f"{mins}m"
            categories_list.append({
                "category": cat_name,
                "time_spent_seconds": spent,
                "time_formatted": time_formatted,
                "count": stats["count"],
                "percentage": round((spent / max(total_time_seconds, 1)) * 100, 1)
            })
        categories_list.sort(key=lambda x: x["time_spent_seconds"], reverse=True)

        hrs_total = total_time_seconds // 3600
        mins_total = (total_time_seconds % 3600) // 60
        total_time_formatted = f"{hrs_total}h {mins_total}m" if hrs_total > 0 else f"{mins_total}m"

        return {
            "date": target_date,
            "total_content_consumption_seconds": total_time_seconds,
            "total_consumption_formatted": total_time_formatted,
            "total_items_analyzed": total_items,
            "emotional_distribution": emotional_distribution,
            "category_breakdown": categories_list,
            "topic_counts": topic_counts,
            "emotional_intensity": intensity_counts,
            "constructiveness": constructiveness_counts,
            "distressing_count": distressing_items,
            "mood_checkin": mood_data,
            "recent_items": rows[:25]
        }

    @staticmethod
    def get_weekly_consumption(user_id: str, start_date: str, end_date: str) -> Dict[str, Any]:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT * FROM consumption_logs 
            WHERE user_id = ? AND date >= ? AND date <= ? 
            ORDER BY date ASC, timestamp ASC
        """, (user_id, start_date, end_date))
        rows = [dict(r) for r in cursor.fetchall()]

        cursor.execute("""
            SELECT * FROM mood_checkins 
            WHERE user_id = ? AND checkin_date >= ? AND checkin_date <= ? 
            ORDER BY checkin_date ASC
        """, (user_id, start_date, end_date))
        mood_rows = {r["checkin_date"]: dict(r) for r in cursor.fetchall()}

        conn.close()

        # Build continuous 7-day timeline
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        end_dt = datetime.strptime(end_date, "%Y-%m-%d")
        cur_dt = start_dt
        daily_map: Dict[str, List[Dict[str, Any]]] = {}
        while cur_dt <= end_dt:
            d_str = cur_dt.strftime("%Y-%m-%d")
            daily_map[d_str] = []
            cur_dt += timedelta(days=1)

        for r in rows:
            d = r.get("date")
            if d in daily_map:
                daily_map[d].append(r)

        timeline = []
        weekly_tones = {"positive": 0, "neutral": 0, "negative": 0, "mixed": 0}
        weekly_categories: Dict[str, int] = {}
        weekly_time_seconds = 0
        weekly_items = len(rows)

        correlation_points = []

        for d_str, day_items in daily_map.items():
            dt = datetime.strptime(d_str, "%Y-%m-%d")
            day_name = dt.strftime("%a") # Mon, Tue, etc.
            day_total = len(day_items)
            day_time = sum(x.get("time_spent_seconds", 0) for x in day_items)
            weekly_time_seconds += day_time

            d_tones = {"positive": 0, "neutral": 0, "negative": 0}
            for it in day_items:
                t = it.get("emotional_tone", "neutral").lower()
                d_tones[t] = d_tones.get(t, 0) + 1
                weekly_tones[t] = weekly_tones.get(t, 0) + 1

                cat = it.get("category", "Other")
                weekly_categories[cat] = weekly_categories.get(cat, 0) + it.get("time_spent_seconds", 0)

            d_denom = max(day_total, 1)
            pos_pct = round((d_tones.get("positive", 0) / d_denom) * 100, 1) if day_total > 0 else 0
            neu_pct = round((d_tones.get("neutral", 0) / d_denom) * 100, 1) if day_total > 0 else 0
            neg_pct = round((d_tones.get("negative", 0) / d_denom) * 100, 1) if day_total > 0 else 0

            mood_obj = mood_rows.get(d_str)

            timeline.append({
                "date": d_str,
                "day_name": day_name,
                "total_items": day_total,
                "total_minutes": round(day_time / 60, 1),
                "positive_pct": pos_pct,
                "neutral_pct": neu_pct,
                "negative_pct": neg_pct,
                "mood": mood_obj.get("mood") if mood_obj else None,
                "mood_score": mood_obj.get("mood_score") if mood_obj else None,
                "note": mood_obj.get("note") if mood_obj else None
            })

            if mood_obj and day_total > 0:
                correlation_points.append({
                    "date": d_str,
                    "negative_pct": neg_pct,
                    "positive_pct": pos_pct,
                    "mood_score": mood_obj["mood_score"],
                    "mood": mood_obj["mood"]
                })

        denom_wk = max(weekly_items, 1)
        weekly_distribution = {
            "positive_pct": round((weekly_tones.get("positive", 0) / denom_wk) * 100, 1),
            "neutral_pct": round((weekly_tones.get("neutral", 0) / denom_wk) * 100, 1),
            "negative_pct": round((weekly_tones.get("negative", 0) / denom_wk) * 100, 1),
            "raw_counts": weekly_tones
        }

        hrs_wk = weekly_time_seconds // 3600
        mins_wk = (weekly_time_seconds % 3600) // 60
        weekly_time_formatted = f"{hrs_wk}h {mins_wk}m" if hrs_wk > 0 else f"{mins_wk}m"

        return {
            "start_date": start_date,
            "end_date": end_date,
            "total_items_analyzed": weekly_items,
            "total_time_seconds": weekly_time_seconds,
            "total_time_formatted": weekly_time_formatted,
            "weekly_distribution": weekly_distribution,
            "category_time_distribution": weekly_categories,
            "timeline": timeline,
            "correlation_points": correlation_points
        }

    @staticmethod
    def save_or_update_mood_checkin(user_id: str, mood: str, mood_score: int, note: str, checkin_date: str) -> str:
        checkin_id = f"mck_{uuid.uuid4().hex[:12]}"
        now = datetime.now().isoformat()
        conn = get_db_connection()
        with conn:
            # Check existing checkin on same day
            cursor = conn.cursor()
            cursor.execute("SELECT checkin_id FROM mood_checkins WHERE user_id = ? AND checkin_date = ?", (user_id, checkin_date))
            row = cursor.fetchone()
            if row:
                checkin_id = row["checkin_id"]
                conn.execute("""
                    UPDATE mood_checkins 
                    SET mood = ?, mood_score = ?, note = ?, created_at = ? 
                    WHERE checkin_id = ?
                """, (mood.lower().strip(), mood_score, note.strip() if note else "", now, checkin_id))
            else:
                conn.execute("""
                    INSERT INTO mood_checkins (checkin_id, user_id, mood, mood_score, note, checkin_date, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (checkin_id, user_id, mood.lower().strip(), mood_score, note.strip() if note else "", checkin_date, now))
        conn.close()
        return checkin_id

    @staticmethod
    def get_mood_checkin(user_id: str, checkin_date: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM mood_checkins WHERE user_id = ? AND checkin_date = ?", (user_id, checkin_date))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def get_mood_history(user_id: str, days: int = 14) -> List[Dict[str, Any]]:
        since_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM mood_checkins WHERE user_id = ? AND checkin_date >= ? ORDER BY checkin_date DESC", (user_id, since_date))
        rows = [dict(r) for r in cursor.fetchall()]
        conn.close()
        return rows

    @staticmethod
    def clear_consumption_logs(user_id: str) -> bool:
        conn = get_db_connection()
        with conn:
            conn.execute("DELETE FROM consumption_logs WHERE user_id = ?", (user_id,))
            conn.execute("DELETE FROM mood_checkins WHERE user_id = ?", (user_id,))
        conn.close()
        return True


# Initialize DB on import
init_db()

