"""
Cognivibe AI - Digital Content Consumption & Mood Intelligence Classifier
Performs multi-dimensional analysis of browsed web content:
1. Emotional Tone: Positive (+), Neutral (=), Negative (-), Mixed
2. Emotional Intensity: Low, Medium, High
3. Topic Identification: Politics, Tragedy, Science, Entertainment, etc.
4. Content Category: News & Current Affairs, Entertainment, Education, Social Media, Other
5. Potentially Distressing Flag & Themes: Violence, Tragedy, Fear, Conflict, Loneliness, None
6. Constructiveness: Informative, Supportive, Uplifting, Harmful, Unclear
7. AI-Generated Intelligence Observations (Daily & Weekly summaries)
"""

import re
import math
from typing import Dict, Any, List, Optional
from datetime import datetime


# Positive keywords & markers (English & Hinglish)
POSITIVE_KEYWORDS = {
    "inspire", "inspiring", "uplifting", "motivate", "motivation", "motivational",
    "happy", "joy", "celebrate", "achievement", "success", "crack", "cracked",
    "awesome", "wonderful", "grateful", "gratitude", "love", "peace", "calm",
    "beautiful", "growth", "hope", "healthy", "comedy", "funny", "hilarious",
    "laughter", "wholesome", "smile", "friendship", "kindness", "support",
    # Hinglish
    "khush", "khushi", "shaant", "maza", "sukoon", "badhiya", "shandaar",
    "zabardast", "pyar", "ummeed", "jeet", "kamyaab", "hassna", "haso"
}

# Negative / Distressing keywords & markers (English & Hinglish)
DISTRESSING_THEMES = {
    "violence": [
        "killed", "murder", "murdered", "shot", "shooting", "attack", "assault",
        "terrorist", "bomb", "stabbing", "massacre", "lynching", "brutal", "war", "genocide",
        "maar", "katla", "dhamaka", "hamla"
    ],
    "tragedy": [
        "disaster", "earthquake", "flood", "casualty", "casualties", "crash",
        "dead", "died", "death", "fatal", "drowned", "collapse", "crisis",
        "tabahi", "maut", "haadsa", "toofan"
    ],
    "conflict": [
        "riot", "protest", "clash", "scandal", "corruption", "arrested", "lawsuit",
        "controversy", "accused", "hate", "fight", "dispute", "blame", "hostile",
        "jhagda", "ladai", "vivad", "danga"
    ],
    "loneliness/depression": [
        "depressed", "depression", "sad", "hopeless", "lonely", "isolated", "suicide",
        "self-harm", "worthless", "exhausted", "pain", "crying", "miserable",
        "akelapan", "udas", "nirash", "dard", "rona", "thak"
    ],
    "fear": [
        "fear", "panic", "warning", "threat", "terrifying", "danger", "catastrophe",
        "darr", "khauf", "khatra", "ghabrahat"
    ]
}

# Educational keywords
EDUCATION_KEYWORDS = {
    "tutorial", "learn", "how to", "guide", "lecture", "course", "algorithm",
    "science", "physics", "math", "history", "explained", "documentary", "study",
    "research", "analysis", "insight", "python", "javascript", "react", "ai",
    "machine learning", "engineering", "book", "summary", "lesson", "education"
}

# Entertainment keywords
ENTERTAINMENT_KEYWORDS = {
    "movie", "trailer", "song", "music", "game", "gaming", "stream", "humor",
    "meme", "standup", "episode", "season", "vlog", "actor", "actress",
    "film", "netflix", "anime", "play", "comedy", "clip", "highlight"
}

# News domains
NEWS_DOMAINS = {
    "bbc.com", "cnn.com", "nytimes.com", "theguardian.com", "reuters.com",
    "ndtv.com", "thehindu.com", "indianexpress.com", "indiatoday.in", "timesofindia.indiatimes.com",
    "hindustantimes.com", "aljazeera.com", "bloomberg.com", "forbes.com", "washingtonpost.com"
}


class ContentConsumptionClassifier:
    """Classifies digital content consumption across multiple emotional and contextual dimensions."""

    def __init__(self):
        # Lazy import of predictor to reuse Hinglish multitask model
        self._predictor = None

    @property
    def predictor(self):
        if self._predictor is None:
            try:
                from ml_engine.inference.predictor import predictor
                self._predictor = predictor
            except Exception:
                self._predictor = None
        return self._predictor

    def classify(self, text: str, title: str = "", domain: str = "", url: str = "") -> Dict[str, Any]:
        """Performs multi-dimensional analysis of a consumed piece of web text."""
        combined_text = f"{title}. {text}".strip()
        lower_text = combined_text.lower()
        words = set(re.findall(r"\b[a-z]{3,}\b", lower_text))

        # 1. Detect Category
        category = self._detect_category(domain, url, lower_text)

        # 2. Check Distressing Themes
        is_distressing = False
        distressing_theme = "none"
        distressing_hits = 0

        for theme, keywords in DISTRESSING_THEMES.items():
            hits = [kw for kw in keywords if kw in lower_text]
            if hits:
                is_distressing = True
                distressing_theme = theme
                distressing_hits += len(hits)
                break

        # 3. Detect Positive Markers
        positive_hits = [kw for kw in POSITIVE_KEYWORDS if kw in lower_text]

        # 4. Integrate with Cognivibe Multitask ML Predictor if available
        ml_emotion = "Neutral"
        ml_dep_related = False
        has_explicit_dep_words = any(kw in lower_text for kw in [
            "depressed", "depression", "hopeless", "sad", "akelapan", "crying", "miserable",
            "worthless", "alone", "isolated", "suicide", "exhausted", "pain", "dard", "rona"
        ])
        
        if self.predictor and len(combined_text) > 10:
            try:
                ml_res = self.predictor.analyze(combined_text[:500])
                # Only trust ML depression prediction if not uncertain and explicit words or crisis flag exists
                is_unc = ml_res.get("uncertainty", {}).get("is_uncertain", False)
                if not is_unc and (has_explicit_dep_words or ml_res.get("metadata", {}).get("crisis_flag")):
                    ml_dep_related = ml_res["task_2_depression_language"]["depression_related"]
                    ml_emotion = ml_res["task_1_emotion"]["predicted_emotion"]
                elif ml_res["task_1_emotion"]["confidence"] > 0.65:
                    ml_emotion = ml_res["task_1_emotion"]["predicted_emotion"]
            except Exception:
                pass

        # 5. Determine Emotional Tone
        is_educational = category == "Education" or any(kw in lower_text for kw in EDUCATION_KEYWORDS)
        
        if is_distressing:
            emotional_tone = "negative"
        elif has_explicit_dep_words or ml_dep_related:
            if len(positive_hits) >= 2:
                emotional_tone = "mixed"
            else:
                emotional_tone = "negative"
        elif len(positive_hits) >= 1:
            if distressing_hits > 0:
                emotional_tone = "mixed"
            else:
                emotional_tone = "positive"
        elif is_educational:
            emotional_tone = "neutral"
        elif ml_emotion in ["Sadness", "Anger", "Fear", "Anxiety/Worry"] and not is_educational and not is_unc:
            emotional_tone = "negative"
        else:
            emotional_tone = "neutral"

        # 6. Determine Emotional Intensity
        if is_distressing and (distressing_hits >= 2 or distressing_theme in ["violence", "tragedy"]):
            intensity = "high"
        elif len(positive_hits) >= 3 or distressing_hits >= 2:
            intensity = "high"
        elif len(positive_hits) >= 1 or distressing_hits == 1 or (ml_emotion in ["Anger", "Fear"] and not is_educational):
            intensity = "medium"
        else:
            intensity = "low"

        # 7. Topic Classification
        topic = self._detect_topic(lower_text, category, distressing_theme)

        # 8. Constructiveness
        constructiveness = self._detect_constructiveness(category, emotional_tone, is_distressing, lower_text)

        # Sentiment score from -1.0 to +1.0
        if emotional_tone == "positive":
            score = 0.7 if intensity == "high" else 0.4
        elif emotional_tone == "negative":
            score = -0.8 if intensity == "high" else -0.5
        elif emotional_tone == "mixed":
            score = 0.0
        else:
            score = 0.1 if any(kw in lower_text for kw in EDUCATION_KEYWORDS) else 0.0

        return {
            "title": title or "Web Page Content",
            "emotional_tone": emotional_tone, # positive, neutral, negative, mixed
            "topic": topic,
            "category": category, # News & current affairs, Entertainment, Education, Social media, Other
            "emotional_intensity": intensity, # low, medium, high
            "is_distressing": is_distressing,
            "distressing_theme": distressing_theme,
            "constructiveness": constructiveness, # informative, supportive, uplifting, harmful, unclear
            "sentiment_score": round(score, 2),
            "ml_detected_emotion": ml_emotion
        }

    def _detect_category(self, domain: str, url: str, text: str) -> str:
        d = domain.lower()
        u = url.lower()

        # Domain matching
        if any(news_d in d for news_d in NEWS_DOMAINS) or "/news" in u:
            return "News & current affairs"
        if "youtube.com" in d or "youtu.be" in d:
            # Check if education or entertainment
            if any(k in text for k in EDUCATION_KEYWORDS):
                return "Education"
            return "Entertainment"
        if any(soc in d for soc in ["reddit.com", "twitter.com", "x.com", "instagram.com", "facebook.com", "linkedin.com"]):
            return "Social media"
        if any(ed in d for ed in ["wikipedia.org", "coursera.org", "udemy.com", "github.com", "medium.com", "stackoverflow.com", "arxiv.org", "edu"]):
            return "Education"
        if any(ent in d for ent in ["netflix.com", "spotify.com", "imdb.com", "twitch.tv"]):
            return "Entertainment"

        # Text keywords matching
        if any(k in text for k in EDUCATION_KEYWORDS):
            return "Education"
        if any(k in text for k in ENTERTAINMENT_KEYWORDS):
            return "Entertainment"

        return "Other"

    def _detect_topic(self, text: str, category: str, distressing_theme: str) -> str:
        if distressing_theme == "violence":
            return "Conflict & Violence"
        if distressing_theme == "tragedy":
            return "Disaster & Tragedy"
        if distressing_theme == "loneliness/depression":
            return "Mental Health & Wellbeing"
        if distressing_theme == "conflict":
            return "Politics & Conflict"

        if any(k in text for k in ["politics", "election", "government", "parliament", "minister", "bjp", "congress", "senate", "policy"]):
            return "Politics & Current Affairs"
        if any(k in text for k in ["code", "software", "programming", "python", "ai", "tech", "react", "app", "startup", "developer"]):
            return "Technology & Engineering"
        if any(k in text for k in ["study", "course", "science", "physics", "biology", "history", "lecture", "research"]):
            return "Science & Education"
        if any(k in text for k in ["workout", "fitness", "diet", "doctor", "health", "sleep", "meditation", "gym"]):
            return "Health & Wellness"
        if any(k in text for k in ["movie", "song", "comedy", "game", "gaming", "music", "meme", "anime"]):
            return "Entertainment & Pop Culture"
        if any(k in text for k in ["finance", "stock", "market", "economy", "crypto", "investment", "money"]):
            return "Finance & Business"
        if any(k in text for k in ["relationship", "family", "friend", "parent", "marriage", "dating"]):
            return "Relationships & Social"

        if category == "News & current affairs":
            return "Current Affairs"
        if category == "Entertainment":
            return "Entertainment"
        if category == "Education":
            return "Education"
        if category == "Social media":
            return "Social Posts"

        return "General Browsing"

    def _detect_constructiveness(self, category: str, tone: str, is_distressing: bool, text: str) -> str:
        if tone == "positive":
            if any(k in text for k in ["help", "guide", "solution", "support", "care"]):
                return "supportive"
            return "uplifting"

        if tone == "negative":
            # If it's a factual news report or educational explanation
            if category in ["News & current affairs", "Education"] or any(k in text for k in ["report", "study", "analysis", "official", "update"]):
                return "informative"
            if is_distressing and any(k in text for k in ["brutal", "horrific", "rage", "destroy", "disgusting", "hate"]):
                return "harmful" # Sensationalized doomscrolling
            return "informative"

        if category == "Education" or any(k in text for k in ["how to", "guide", "tips", "learn"]):
            return "informative"

        return "unclear"

    # ------------------ AI REPORT OBSERVATIONS GENERATOR ------------------
    def generate_daily_observations(self, daily_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generates natural language AI observations for the Daily Digital Wellbeing Report."""
        items = daily_data.get("total_items_analyzed", 0)
        time_fmt = daily_data.get("total_consumption_formatted", "0m")
        distrib = daily_data.get("emotional_distribution", {})
        pos_pct = distrib.get("positive_pct", 0)
        neu_pct = distrib.get("neutral_pct", 0)
        neg_pct = distrib.get("negative_pct", 0)
        categories = daily_data.get("category_breakdown", [])
        distressing_count = daily_data.get("distressing_count", 0)
        mood_checkin = daily_data.get("mood_checkin")

        if items == 0:
            return {
                "something_to_notice": "No digital consumption recorded yet for this date. Enable the browser extension to begin monitoring.",
                "positive_pattern": "Start your browsing session to gather initial wellbeing insights.",
                "overall_summary": "No data available.",
                "mood_correlation_insight": "Log your mood at the end of the day to see how digital consumption influences your wellbeing."
            }

        # 1. Something to notice
        if neg_pct >= 30:
            something_to_notice = (
                f"A relatively large share of today's analyzed content ({neg_pct}%) involved distressing news, "
                f"conflict, or negative emotional themes ({distressing_count} items flagged). "
                f"Prolonged exposure to distressing events can quietly elevate stress and cognitive fatigue."
            )
        elif distressing_count >= 3:
            something_to_notice = (
                f"You encountered {distressing_count} items today with distressing or tragic themes. "
                "Even when reading for informational purposes, taking brief mental breaks helps prevent digital overwhelm."
            )
        elif neu_pct >= 60:
            something_to_notice = (
                f"Today's browsing was heavily objective and factual ({neu_pct}% neutral). "
                "You maintained low emotional volatility throughout your sessions."
            )
        else:
            something_to_notice = (
                f"Negative content remained well-controlled today at {neg_pct}%, with balanced exposure across topics."
            )

        # 2. Positive pattern
        edu_cat = next((c for c in categories if c["category"] == "Education"), None)
        ent_cat = next((c for c in categories if c["category"] == "Entertainment"), None)

        if pos_pct >= 30 and edu_cat:
            positive_pattern = (
                f"Educational and motivational content accounted for {edu_cat['time_formatted']} ({edu_cat['percentage']}%) "
                f"of today's browsing, with {pos_pct}% positive emotional tone. This represents a healthy, constructive digital diet."
            )
        elif pos_pct >= 25:
            positive_pattern = (
                f"Uplifting and positive content made up {pos_pct}% of your consumption today, "
                "providing consistent emotional equilibrium."
            )
        elif edu_cat:
            positive_pattern = (
                f"You dedicated {edu_cat['time_formatted']} to educational material today, "
                "prioritizing productive learning over passive social scrolling."
            )
        elif ent_cat:
            positive_pattern = (
                f"Entertainment accounted for {ent_cat['time_formatted']}, offering relaxed leisure without distressing overtones."
            )
        else:
            positive_pattern = "Your browsing activity reflected a stable, self-directed consumption pattern."

        # 3. Overall summary
        dominant_tone = "Positive" if pos_pct > max(neu_pct, neg_pct) else ("Negative" if neg_pct > neu_pct else "Neutral / Balanced")
        overall_summary = (
            f"Across {time_fmt} of browsing and {items} analyzed items, your consumption environment was primarily {dominant_tone}. "
            f"Content breakdown: {pos_pct}% Positive, {neu_pct}% Neutral, {neg_pct}% Negative."
        )

        # 4. Mood Correlation Insight
        if mood_checkin:
            user_mood = mood_checkin.get("mood", "neutral").capitalize()
            score = mood_checkin.get("mood_score", 3)
            if score <= 2 and neg_pct >= 25:
                mood_correlation_insight = (
                    f"You self-reported feeling **{user_mood}** today. Today's elevated proportion of negative/distressing content "
                    f"({neg_pct}%) aligns with lower self-reported emotional energy. "
                    "Notice whether taking an evening screen-break helps your mood recover."
                )
            elif score >= 4 and pos_pct >= 25:
                mood_correlation_insight = (
                    f"You self-reported feeling **{user_mood}** today. This correlates with high engagement in positive ({pos_pct}%) "
                    "and constructive content, showing a strong alignment between your digital environment and daily emotional state."
                )
            else:
                mood_correlation_insight = (
                    f"You recorded your mood as **{user_mood}**. Your digital consumption was {dominant_tone.lower()}. "
                    "Continue tracking over multiple weeks to observe your personal correlation trends."
                )
        else:
            mood_correlation_insight = (
                "You haven't recorded your mood yet today! Select how you felt today below to unlock your "
                "Digital Consumption vs. Actual Mood correlation analysis."
            )

        return {
            "something_to_notice": something_to_notice,
            "positive_pattern": positive_pattern,
            "overall_summary": overall_summary,
            "mood_correlation_insight": mood_correlation_insight
        }

    def generate_weekly_observations(self, weekly_data: Dict[str, Any]) -> Dict[str, Any]:
        """Synthesizes 7-day trend observations and correlation findings."""
        items = weekly_data.get("total_items_analyzed", 0)
        time_fmt = weekly_data.get("total_time_formatted", "0m")
        distrib = weekly_data.get("weekly_distribution", {})
        pos_pct = distrib.get("positive_pct", 0)
        neg_pct = distrib.get("negative_pct", 0)
        neu_pct = distrib.get("neutral_pct", 0)
        timeline = weekly_data.get("timeline", [])
        correlations = weekly_data.get("correlation_points", [])

        if items == 0:
            return {
                "headline": "No consumption data available for this week.",
                "trend_analysis": "Use the browser extension throughout the week to see your long-term consumption trends.",
                "correlation_summary": "Insufficient data for correlation analysis."
            }

        # Check negative spikes
        highest_neg_day = max(timeline, key=lambda x: x.get("negative_pct", 0)) if timeline else None
        highest_pos_day = max(timeline, key=lambda x: x.get("positive_pct", 0)) if timeline else None

        trend_analysis = (
            f"Over the past 7 days, you consumed {time_fmt} of digital content across {items} items. "
            f"Overall weekly distribution stood at {pos_pct}% Positive, {neu_pct}% Neutral, and {neg_pct}% Negative. "
        )
        if highest_neg_day and highest_neg_day.get("negative_pct", 0) > 30:
            trend_analysis += f"Negative content peaked on {highest_neg_day['day_name']} ({highest_neg_day['negative_pct']}%), often driven by breaking news cycles. "
        if highest_pos_day and highest_pos_day.get("positive_pct", 0) > 35:
            trend_analysis += f"Your most uplifting day was {highest_pos_day['day_name']} with {highest_pos_day['positive_pct']}% positive content. "

        # Correlation summary
        if len(correlations) >= 3:
            # Check if high negative coincides with lower mood
            low_mood_days = [c for c in correlations if c["mood_score"] <= 2]
            high_neg_days = [c for c in correlations if c["negative_pct"] >= 25]
            overlap = [c for c in low_mood_days if c["negative_pct"] >= 25]

            if len(overlap) >= 1:
                correlation_summary = (
                    f"Noticeable Correlation Detected: On days where distressing or negative content exceeded 25%, "
                    f"your self-reported mood tended to shift towards Stressed or Anxious ({len(overlap)} of {len(correlations)} logged days). "
                    "While content consumption does not cause mood changes on its own, your digital environment appears to be an active influencer."
                )
            else:
                correlation_summary = (
                    "Your self-reported mood has shown resilient stability, even during fluctuations in daily content sentiment. "
                    "Maintaining scheduled offline intervals has supported consistent emotional wellbeing."
                )
        else:
            correlation_summary = (
                f"You have logged mood check-ins for {len(correlations)} day(s) this week. "
                "Log your mood for at least 3-4 days to generate statistical correlation curves."
            )

        return {
            "headline": f"Weekly Digital Wellbeing Report: {pos_pct}% Positive vs {neg_pct}% Negative across {time_fmt}",
            "trend_analysis": trend_analysis,
            "correlation_summary": correlation_summary
        }


# Global instance
content_classifier = ContentConsumptionClassifier()
