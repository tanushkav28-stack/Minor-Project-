"""
Cognivibe AI - Report Generation Service
Builds comprehensive clinical-grade research summaries with printable HTML/PDF output.
"""

from typing import Dict, Any, List
from datetime import datetime


def generate_html_report(user: Dict[str, Any], summary: Dict[str, Any], history: List[Dict[str, Any]], title: str) -> str:
    now_str = datetime.now().strftime("%B %d, %Y - %I:%M %p")
    total = summary.get("total_analyses", 0)
    dep_count = summary.get("depression_language_count", 0)
    dep_pct = summary.get("depression_percentage", 0.0)
    avg_unc = summary.get("avg_uncertainty", 0.0)

    emotions = summary.get("emotion_distribution", {})
    indicators = summary.get("indicator_distribution", {})

    emotions_rows = "".join([
        f"<tr><td>{emo}</td><td><strong>{cnt}</strong></td><td>{round((cnt/max(total,1))*100, 1)}%</td></tr>"
        for emo, cnt in emotions.items()
    ]) or "<tr><td colspan='3'>No emotion data recorded.</td></tr>"

    indicators_rows = "".join([
        f"<tr><td>{ind.replace('_', ' ').title()}</td><td><strong>{cnt}</strong></td><td>{round((cnt/max(dep_count,1))*100, 1)}%</td></tr>"
        for ind, cnt in indicators.items()
    ]) or "<tr><td colspan='3'>No depressive language indicators detected.</td></tr>"

    history_rows = "".join([
        f"<tr><td>{h.get('created_at', '')[:16]}</td><td>{h.get('source_type', '')}</td><td>{h.get('predicted_emotion', '')}</td><td>{'Yes (' + str(h.get('predicted_indicator', '')) + ')' if h.get('depression_related') == 1 else 'No'}</td><td>{h.get('input_text', '')[:65]}...</td></tr>"
        for h in history[:15]
    ]) or "<tr><td colspan='5'>No records found.</td></tr>"

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>{title} - Cognivibe AI</title>
<style>
    body {{
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #1e293b;
        background: #ffffff;
        margin: 0;
        padding: 40px;
        line-height: 1.5;
    }}
    .header {{
        border-bottom: 2px solid #3b82f6;
        padding-bottom: 20px;
        margin-bottom: 25px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
    }}
    .title {{ font-size: 26px; font-weight: 800; color: #1e3a8a; margin: 0; }}
    .subtitle {{ font-size: 14px; color: #64748b; margin-top: 5px; }}
    .badge {{
        background: #eff6ff;
        color: #2563eb;
        padding: 6px 12px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 600;
        border: 1px solid #bfdbfe;
    }}
    .summary-grid {{
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 15px;
        margin-bottom: 30px;
    }}
    .card {{
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 16px;
        text-align: center;
    }}
    .card-val {{ font-size: 24px; font-weight: 700; color: #0f172a; margin-top: 4px; }}
    .card-label {{ font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }}
    h2 {{ font-size: 18px; color: #1e293b; margin-top: 30px; margin-bottom: 12px; border-left: 4px solid #3b82f6; padding-left: 10px; }}
    table {{ width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px; }}
    th, td {{ padding: 10px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }}
    th {{ background: #f1f5f9; color: #475569; font-weight: 600; }}
    .disclaimer-box {{
        background: #fffbeb;
        border: 1px solid #fef3c7;
        border-left: 4px solid #f59e0b;
        padding: 16px;
        border-radius: 6px;
        margin-top: 40px;
        font-size: 12px;
        color: #92400e;
    }}
    .print-btn {{
        background: #2563eb;
        color: white;
        border: none;
        padding: 10px 20px;
        font-weight: 600;
        border-radius: 6px;
        cursor: pointer;
        margin-bottom: 20px;
    }}
    @media print {{
        .print-btn {{ display: none; }}
        body {{ padding: 0; }}
    }}
</style>
</head>
<body>
    <button class="print-btn" onclick="window.print()">📥 Print / Save as PDF</button>

    <div class="header">
        <div>
            <h1 class="title">Cognivibe AI (MannSetu)</h1>
            <div class="subtitle">Mental Health Language Pattern & Emotion Screening Report</div>
        </div>
        <div style="text-align: right;">
            <span class="badge">Research Screening Report</span>
            <div style="font-size: 12px; color: #64748b; margin-top: 6px;">Generated: {now_str}</div>
            <div style="font-size: 12px; color: #64748b;">Subject: {user.get('name')} ({user.get('email')})</div>
        </div>
    </div>

    <div class="summary-grid">
        <div class="card">
            <div class="card-label">Total Analyzed Texts</div>
            <div class="card-val">{total}</div>
        </div>
        <div class="card">
            <div class="card-label">Depression-Related Ratio</div>
            <div class="card-val">{dep_pct}%</div>
        </div>
        <div class="card">
            <div class="card-label">Flagged Utterances</div>
            <div class="card-val">{dep_count}</div>
        </div>
        <div class="card">
            <div class="card-label">Avg Model Uncertainty</div>
            <div class="card-val">{avg_unc}</div>
        </div>
    </div>

    <h2>1. Emotion Category Distribution (Task 1)</h2>
    <table>
        <thead>
            <tr><th>Emotion Category</th><th>Count</th><th>Proportion</th></tr>
        </thead>
        <tbody>
            {emotions_rows}
        </tbody>
    </table>

    <h2>2. Depression Linguistic Indicators (Task 2)</h2>
    <table>
        <thead>
            <tr><th>Linguistic Marker</th><th>Count</th><th>Share of Flagged Texts</th></tr>
        </thead>
        <tbody>
            {indicators_rows}
        </tbody>
    </table>

    <h2>3. Recent Social Media Language Activity Sample</h2>
    <table>
        <thead>
            <tr><th>Timestamp</th><th>Source Platform</th><th>Detected Emotion</th><th>Depression Flag</th><th>Excerpt</th></tr>
        </thead>
        <tbody>
            {history_rows}
        </tbody>
    </table>

    <div class="disclaimer-box">
        <strong>ETHICAL, LEGAL & CLINICAL DISCLAIMER:</strong><br>
        This report was generated by Cognivibe AI for academic research and assistive screening exploration. 
        It reflects statistical text classification using multilingual natural language processing on Hindi-English code-mixed social media samples. 
        <strong>This document DOES NOT constitute a medical diagnosis of clinical depression, bipolar disorder, or any psychiatric condition.</strong>
        If you or the subject are experiencing distress, hopelessness, or thoughts of self-harm, please contact qualified medical professionals or call the Tele-MANAS helpline at <strong>14416 / 1800-891-4416</strong> or KIRAN at <strong>1800-599-0019</strong>.
    </div>
</body>
</html>
"""
    return html

