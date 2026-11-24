"""
Cognivibe AI - Reports API Endpoints
"""

from datetime import datetime, timedelta
from typing import Dict, Any, Tuple, Optional
from backend.app.database.session import DatabaseService
from backend.app.services.report_service import generate_html_report


def handle_generate_report(body: Dict[str, Any], current_user: Optional[Dict[str, Any]]) -> Tuple[int, Dict[str, Any]]:
    if not current_user:
        return 401, {"detail": "Authentication required."}

    title = (body.get("title") or "").strip() or "Cognivibe Wellbeing & Language Screening Report"
    report_type = (body.get("report_type") or "comprehensive").strip()

    user_id = current_user["user_id"]
    summary = DatabaseService.get_dashboard_summary(user_id)
    history = DatabaseService.get_analysis_history(user_id, limit=30)
    mood_history = DatabaseService.get_mood_history(user_id, days=30)

    end_dt = datetime.now()
    start_dt = end_dt - timedelta(days=6)
    weekly_consumption = DatabaseService.get_weekly_consumption(
        user_id,
        start_dt.strftime("%Y-%m-%d"),
        end_dt.strftime("%Y-%m-%d")
    )

    report_payload = {
        "title": title,
        "report_type": report_type,
        "summary": summary,
        "sample_history": history[:15],
        "mood_history": mood_history[:30],
        "weekly_consumption": {
            "start_date": weekly_consumption.get("start_date"),
            "end_date": weekly_consumption.get("end_date"),
            "total_items_analyzed": weekly_consumption.get("total_items_analyzed", 0),
            "total_time_formatted": weekly_consumption.get("total_time_formatted", "0m"),
            "weekly_distribution": weekly_consumption.get("weekly_distribution", {}),
        }
    }

    report_id = DatabaseService.save_report(
        user_id=user_id,
        title=title,
        report_type=report_type,
        summary_data=report_payload
    )

    return 201, {
        "report_id": report_id,
        "title": title,
        "report_type": report_type,
        "generated_at": datetime.now().isoformat(),
        "summary": summary,
        "download_url": f"/api/reports/{report_id}/download"
    }


def handle_list_reports(current_user: Optional[Dict[str, Any]]) -> Tuple[int, Dict[str, Any]]:
    if not current_user:
        return 401, {"detail": "Authentication required."}

    reports = DatabaseService.get_user_reports(current_user["user_id"])
    return 200, {
        "total": len(reports),
        "reports": reports
    }


def handle_download_report(report_id: str, current_user: Optional[Dict[str, Any]]) -> Tuple[int, str]:
    if not current_user:
        return 401, "Authentication required."

    user_id = current_user["user_id"]
    saved_report = DatabaseService.get_report_by_id(report_id, user_id)
    if not saved_report:
        return 404, "Report not found."

    summary_data = saved_report.get("summary_data") or {}
    summary = summary_data.get("summary") or DatabaseService.get_dashboard_summary(user_id)
    history = DatabaseService.get_analysis_history(user_id, limit=30)
    mood_history = DatabaseService.get_mood_history(user_id, days=30)

    end_dt = datetime.now()
    start_dt = end_dt - timedelta(days=6)
    weekly_consumption = DatabaseService.get_weekly_consumption(
        user_id,
        start_dt.strftime("%Y-%m-%d"),
        end_dt.strftime("%Y-%m-%d")
    )

    html_content = generate_html_report(
        user=current_user,
        summary=summary,
        history=history,
        title=saved_report.get("title") or "Cognivibe AI Screening Report",
        report_type=saved_report.get("report_type") or "comprehensive",
        generated_at=saved_report.get("generated_at"),
        mood_history=mood_history,
        weekly_consumption=weekly_consumption
    )

    return 200, html_content


def handle_delete_report(report_id: str, current_user: Optional[Dict[str, Any]]) -> Tuple[int, Dict[str, Any]]:
    if not current_user:
        return 401, {"detail": "Authentication required."}

    deleted = DatabaseService.delete_report(report_id, current_user["user_id"])
    if not deleted:
        return 404, {"detail": "Report not found."}
    return 200, {"message": "Report deleted successfully."}
