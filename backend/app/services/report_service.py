"""
Cognivibe AI - Report Generation Service
Builds comprehensive clinical-grade research & mood wellbeing summaries with printable HTML/PDF output.
"""

from html import escape
from typing import Dict, Any, List, Optional
from datetime import datetime


MOOD_EMOJI = {
    "happy": "😊 Happy",
    "calm": "😌 Calm",
    "neutral": "😐 Neutral",
    "stressed": "😫 Stressed",
    "anxious": "😰 Anxious",
    "sad": "😢 Sad",
}


def generate_html_report(
    user: Dict[str, Any],
    summary: Dict[str, Any],
    history: List[Dict[str, Any]],
    title: str,
    report_type: str = "comprehensive",
    generated_at: Optional[str] = None,
    mood_history: Optional[List[Dict[str, Any]]] = None,
    weekly_consumption: Optional[Dict[str, Any]] = None,
) -> str:
    if generated_at:
        try:
            now_str = datetime.fromisoformat(generated_at).strftime("%B %d, %Y - %I:%M %p")
        except Exception:
            now_str = generated_at[:16].replace("T", " ")
    else:
        now_str = datetime.now().strftime("%B %d, %Y - %I:%M %p")

    safe_title = escape(title or "Cognivibe AI Screening Report")
    safe_user_name = escape(str(user.get("name", "User")))
    safe_user_email = escape(str(user.get("email", "")))
    report_label = escape(report_type.replace("_", " ").title())

    total = summary.get("total_analyses", 0) or 0
    dep_count = summary.get("depression_language_count", 0) or 0
    dep_pct = summary.get("depression_percentage", 0.0) or 0.0
    avg_unc = summary.get("avg_uncertainty", 0.0) or 0.0

    emotions = summary.get("emotion_distribution", {}) or {}
    indicators = summary.get("indicator_distribution", {}) or {}

    mood_history = mood_history or []
    avg_mood = (
        round(sum(m.get("mood_score", 3) for m in mood_history) / len(mood_history), 2)
        if mood_history else None
    )

    weekly_consumption = weekly_consumption or {}
    weekly_dist = weekly_consumption.get("weekly_distribution", {}) or {}

    emotions_rows = "".join([
        f"""<tr>
            <td><strong>{escape(str(emo))}</strong></td>
            <td>{cnt}</td>
            <td>{round((cnt / max(total, 1)) * 100, 1)}%</td>
            <td style="width: 38%;">
                <div class="bar-bg"><div class="bar-fill" style="width: {min(100, round((cnt / max(total, 1)) * 100, 1))}%;"></div></div>
            </td>
        </tr>"""
        for emo, cnt in emotions.items()
    ]) or "<tr><td colspan='4' class='empty'>No linguistic emotion samples recorded yet. Use Live Analysis to add entries.</td></tr>"

    indicators_rows = "".join([
        f"<tr><td>{escape(str(ind).replace('_', ' ').title())}</td><td><strong>{cnt}</strong></td><td>{round((cnt / max(dep_count, 1)) * 100, 1)}%</td></tr>"
        for ind, cnt in indicators.items()
    ]) or "<tr><td colspan='3' class='empty'>No depressive language indicators detected.</td></tr>"

    mood_rows = "".join([
        f"""<tr>
            <td>{escape(str(m.get('checkin_date', '')))}</td>
            <td><strong>{escape(MOOD_EMOJI.get(str(m.get('mood', '')).lower(), str(m.get('mood', '')).title()))}</strong></td>
            <td>{m.get('mood_score', '-')}/5</td>
            <td>{escape(str(m.get('note') or '—'))}</td>
        </tr>"""
        for m in mood_history[:14]
    ]) or "<tr><td colspan='4' class='empty'>No daily mood check-ins logged yet.</td></tr>"

    history_rows = "".join([
        f"""<tr>
            <td>{escape(str(h.get('created_at', ''))[:16].replace('T', ' '))}</td>
            <td>{escape(str(h.get('source_type', '')).replace('_', ' '))}</td>
            <td>{escape(str(h.get('predicted_emotion', '')))}</td>
            <td>{'Yes (' + escape(str(h.get('predicted_indicator', ''))) + ')' if h.get('depression_related') == 1 else 'No'}</td>
            <td>{escape(str(h.get('input_text', ''))[:75])}{'...' if len(str(h.get('input_text', ''))) > 75 else ''}</td>
        </tr>"""
        for h in (history or [])[:15]
    ]) or "<tr><td colspan='5' class='empty'>No language analysis records found.</td></tr>"

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>{safe_title} - Cognivibe AI</title>
<style>
    body {{
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #244B43;
        background: #F8F6F0;
        margin: 0;
        padding: 36px;
        line-height: 1.55;
    }}
    .sheet {{
        max-width: 960px;
        margin: 0 auto;
        background: #ffffff;
        border: 1px solid #d7e5dc;
        border-radius: 20px;
        padding: 36px;
        box-shadow: 0 12px 35px -10px rgba(36, 75, 67, 0.12);
    }}
    .header {{
        border-bottom: 2px solid #A9C4B2;
        padding-bottom: 18px;
        margin-bottom: 24px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 20px;
        flex-wrap: wrap;
    }}
    .title {{ font-size: 24px; font-weight: 800; color: #244B43; margin: 0; }}
    .subtitle {{ font-size: 13px; color: #4b6b64; margin-top: 4px; }}
    .badge {{
        display: inline-block;
        background: #E9F0E7;
        color: #244B43;
        padding: 5px 12px;
        border-radius: 9999px;
        font-size: 11px;
        font-weight: 700;
        border: 1px solid #A9C4B2;
        text-transform: uppercase;
        letter-spacing: 0.4px;
    }}
    .summary-grid {{
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 14px;
        margin-bottom: 28px;
    }}
    .card {{
        background: #F2F7F1;
        border: 1px solid #d7e5dc;
        border-radius: 14px;
        padding: 15px;
        text-align: center;
    }}
    .card-val {{ font-size: 24px; font-weight: 800; color: #244B43; margin-top: 4px; }}
    .card-label {{ font-size: 11px; color: #4b6b64; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; }}
    h2 {{
        font-size: 16px;
        color: #244B43;
        margin-top: 28px;
        margin-bottom: 10px;
        border-left: 4px solid #2F5E54;
        padding-left: 10px;
    }}
    table {{ width: 100%; border-collapse: collapse; margin-bottom: 22px; font-size: 12.5px; }}
    th, td {{ padding: 9px 12px; text-align: left; border-bottom: 1px solid #e6efe9; }}
    th {{ background: #E9F0E7; color: #244B43; font-weight: 700; }}
    .empty {{ color: #64748b; font-style: italic; text-align: center; padding: 16px; }}
    .bar-bg {{ width: 100%; height: 8px; background: #e9f0e7; border-radius: 9999px; overflow: hidden; }}
    .bar-fill {{ height: 100%; background: #2F5E54; border-radius: 9999px; }}
    .wellbeing-strip {{
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-bottom: 16px;
    }}
    .strip-box {{
        background: #F8F6F0;
        border: 1px solid #dce8e0;
        border-radius: 12px;
        padding: 12px 14px;
        font-size: 12px;
    }}
    .disclaimer-box {{
        background: #fffbeb;
        border: 1px solid #fef3c7;
        border-left: 4px solid #f59e0b;
        padding: 15px;
        border-radius: 8px;
        margin-top: 32px;
        font-size: 12px;
        color: #92400e;
    }}
    .actions {{
        max-width: 960px;
        margin: 0 auto 16px auto;
        display: flex;
        justify-content: flex-end;
    }}
    .print-btn {{
        background: #244B43;
        color: #F8F6F0;
        border: none;
        padding: 10px 20px;
        font-weight: 700;
        border-radius: 12px;
        cursor: pointer;
        font-size: 13px;
    }}
    .print-btn:hover {{ background: #17332D; }}
    @media print {{
        .actions {{ display: none; }}
        body {{ background: #ffffff; padding: 0; }}
        .sheet {{ box-shadow: none; border: none; padding: 0; }}
    }}
</style>
</head>
<body>
    <div class="actions">
        <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
    </div>

    <div class="sheet">
        <div class="header">
            <div>
                <h1 class="title">{safe_title}</h1>
                <div class="subtitle">Cognivibe AI — Mindful Language Pattern &amp; Emotional Wellbeing Report</div>
            </div>
            <div style="text-align: right;">
                <span class="badge">{report_label}</span>
                <div style="font-size: 12px; color: #4b6b64; margin-top: 6px;">Generated: {escape(now_str)}</div>
                <div style="font-size: 12px; color: #4b6b64;">Subject: {safe_user_name} ({safe_user_email})</div>
            </div>
        </div>

        <div class="summary-grid">
            <div class="card">
                <div class="card-label">Analyzed Texts</div>
                <div class="card-val">{total}</div>
            </div>
            <div class="card">
                <div class="card-label">Distress Signal Ratio</div>
                <div class="card-val">{dep_pct}%</div>
            </div>
            <div class="card">
                <div class="card-label">Mood Check-ins</div>
                <div class="card-val">{len(mood_history)}</div>
            </div>
            <div class="card">
                <div class="card-label">Avg Mood Score</div>
                <div class="card-val">{f'{avg_mood}/5' if avg_mood is not None else 'N/A'}</div>
            </div>
        </div>

        <h2>1. Mood &amp; Digital Wellbeing Overview (Last 7-30 Days)</h2>
        <div class="wellbeing-strip">
            <div class="strip-box">
                <strong>Weekly Items Evaluated:</strong><br/>
                {weekly_consumption.get('total_items_analyzed', 0)} items ({escape(str(weekly_consumption.get('total_time_formatted', '0m')))})
            </div>
            <div class="strip-box">
                <strong>Uplifting vs. Heavy Mix:</strong><br/>
                +{weekly_dist.get('positive_pct', 0)}% Positive &nbsp;|&nbsp; &minus;{weekly_dist.get('negative_pct', 0)}% Negative
            </div>
            <div class="strip-box">
                <strong>Avg Model Uncertainty:</strong><br/>
                {avg_unc}
            </div>
        </div>
        <table>
            <thead>
                <tr><th>Date</th><th>Self-Reported Mood</th><th>Score</th><th>Personal Reflection Note</th></tr>
            </thead>
            <tbody>
                {mood_rows}
            </tbody>
        </table>

        <h2>2. Emotion Category Distribution (Task 1)</h2>
        <table>
            <thead>
                <tr><th>Emotion Category</th><th>Count</th><th>Proportion</th><th>Visual Share</th></tr>
            </thead>
            <tbody>
                {emotions_rows}
            </tbody>
        </table>

        <h2>3. Depression Linguistic Indicators (Task 2)</h2>
        <table>
            <thead>
                <tr><th>Linguistic Marker</th><th>Count</th><th>Share of Flagged Texts</th></tr>
            </thead>
            <tbody>
                {indicators_rows}
            </tbody>
        </table>

        <h2>4. Recent Social Media Language Activity Sample</h2>
        <table>
            <thead>
                <tr><th>Timestamp</th><th>Source</th><th>Detected Emotion</th><th>Distress Flag</th><th>Excerpt</th></tr>
            </thead>
            <tbody>
                {history_rows}
            </tbody>
        </table>

        <div class="disclaimer-box">
            <strong>ETHICAL, LEGAL &amp; CLINICAL DISCLAIMER:</strong><br>
            This report was generated by Cognivibe AI for academic research and assistive screening exploration.
            It reflects statistical text classification using multilingual natural language processing on Hindi-English code-mixed samples and self-reported mood logs.
            <strong>This document DOES NOT constitute a medical diagnosis of clinical depression, bipolar disorder, or any psychiatric condition.</strong>
            If you or the subject are experiencing distress, hopelessness, or thoughts of self-harm, please contact qualified medical professionals or call the Tele-MANAS helpline at <strong>14416 / 1800-891-4416</strong> or KIRAN at <strong>1800-599-0019</strong>.
        </div>
    </div>
</body>
</html>
"""
    return html
