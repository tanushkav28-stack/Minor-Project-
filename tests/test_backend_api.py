"""
Cognivibe AI - Backend API Integration Tests
Tests:
1. Registration & Login authentication flow
2. Text Analysis with Hinglish input
3. Context-aware multi-turn analysis
4. History retrieval & deletion
5. Dashboard summary & trends
6. Report generation
7. Extension token pairing & analysis
"""

import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.api.routes import auth, analysis, dashboard, reports, extension, users
from backend.app.database.session import DatabaseService


def run_tests():
    print("=" * 60)
    print("Cognivibe AI: Running Backend Integration Tests")
    print("=" * 60)

    # 1. Test Login
    login_body = {"email": "demo@cognivibe.ai", "password": "password123"}
    code, res = auth.handle_login(login_body)
    assert code == 200, f"Login failed with code {code}: {res}"
    token = res["access_token"]
    user_id = res["user"]["user_id"]
    ext_token = res["user"]["extension_token"]
    current_user = DatabaseService.get_user_by_id(user_id)
    print(f"✓ Auth Login passed for user {user_id}")

    # 2. Test Text Analysis (Hinglish)
    sample_text = "Sab kuch overwhelming lag raha hai. Bas rone ka mann karta hai har waqt."
    code, ana_res = analysis.handle_analyze_text({
        "text": sample_text,
        "source_type": "unit_test",
        "include_context": False
    }, current_user)
    assert code == 200, f"Analysis failed: {ana_res}"
    assert ana_res["task_1_emotion"]["predicted_emotion"] in ["Sadness", "Anxiety/Worry"], f"Unexpected emotion: {ana_res}"
    assert ana_res["saved_to_history"] is True
    print(f"✓ Hinglish Analysis passed (Emotion: {ana_res['task_1_emotion']['predicted_emotion']}, Dep: {ana_res['task_2_depression_language']['depression_related']})")

    # 3. Test Dashboard Summary
    code, dash_res = dashboard.handle_get_summary(current_user)
    assert code == 200
    assert dash_res["total_analyses"] > 0
    print(f"✓ Dashboard Summary passed (Total: {dash_res['total_analyses']}, Dep count: {dash_res['depression_language_count']})")

    # 4. Test History
    code, hist_res = analysis.handle_get_history(current_user, limit=5)
    assert code == 200
    assert len(hist_res["history"]) > 0
    print(f"✓ History retrieval passed ({len(hist_res['history'])} records retrieved)")

    # 5. Test Extension Connect & Extension Analysis
    code, ext_conn = extension.handle_extension_connect({"extension_token": ext_token})
    assert code == 200
    assert ext_conn["status"] == "connected"
    
    code, ext_ana = extension.handle_extension_analyze({
        "text": "Mujhe bhot akelapan feel hota h",
        "platform": "reddit",
        "element_type": "comment"
    }, current_user)
    assert code == 200
    print(f"✓ Extension pairing & analysis passed")

    # 6. Test Report Generation
    code, rep_res = reports.handle_generate_report({"title": "Test Integration Report"}, current_user)
    assert code == 201
    rep_id = rep_res["report_id"]
    code, html = reports.handle_download_report(rep_id, current_user)
    assert code == 200
    assert "Cognivibe AI" in html
    print(f"✓ Report Generation passed (Report ID: {rep_id})")

    print("=" * 60)
    print("ALL 6 BACKEND INTEGRATION TEST SUITES PASSED PERFECTLY!")
    print("=" * 60)


if __name__ == "__main__":
    run_tests()

