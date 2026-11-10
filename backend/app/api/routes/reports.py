"""
Cognivibe AI - Reports API Endpoints
"""

from typing import Dict, Any, Tuple, Optional
from backend.app.database.session import DatabaseService
from backend.app.services.report_service import generate_html_report


def handle_generate_report(body: Dict[str, Any], current_user: Optional[Dict[str, Any]]) -> Tuple[int, Dict[str, Any]]:
    if not current_user:
        return 401, {"detail": "Authentication required."}

    title = body.get("title", "Linguistic Pattern Analysis Report")
    report_type = body.get("report_type", "summary")

    summary = DatabaseService.get_dashboard_summary(current_user["user_id"])
    history = DatabaseService.get_analysis_history(current_user["user_id"], limit=20)

    report_payload = {
        "title": title,
        "summary": summary,
        "sample_history": history[:10]
    }

    report_id = DatabaseService.save_report(
        user_id=current_user["user_id"],
        title=title,
        report_type=report_type,
        summary_data=report_payload
    )

    return 201, {
        "report_id": report_id,
        "title": title,
        "report_type": report_type,
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

    summary = DatabaseService.get_dashboard_summary(current_user["user_id"])
    history = DatabaseService.get_analysis_history(current_user["user_id"], limit=30)

    html_content = generate_html_report(
        user=current_user,
        summary=summary,
        history=history,
        title="Cognivibe AI Clinical Screening Report"
    )

    return 200, html_content

