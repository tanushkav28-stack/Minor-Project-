"""
Cognivibe AI - Database Seeder
Seeds an initial demo user and realistic browsing analysis history,
as well as 7 days of Digital Consumption & Mood Intelligence data.
"""

import sys
import os
import random
from datetime import datetime, timedelta

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.core.security import hash_password
from backend.app.database.session import DatabaseService, get_db_connection
from ml_engine.inference.predictor import predictor
from ml_engine.inference.content_classifier import content_classifier


def seed_demo_data():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT user_id FROM users WHERE email = 'demo@cognivibe.ai'")
    exists = cursor.fetchone()
    conn.close()

    if not exists:
        print("Seeding demo account: demo@cognivibe.ai / password123")
        user = DatabaseService.create_user(
            name="Aarav Sharma",
            email="demo@cognivibe.ai",
            password_hash=hash_password("password123")
        )
        user_id = user["user_id"]

        demo_posts = [
            {"text": "Mujhe bhot akelapan feel hota h, kisi se baat karne ka mann nahi karta.", "source": "browser_extension_reddit"},
            {"text": "I feel so isolated in this crowded college hostel yaar. Nobody understands me.", "source": "browser_extension_reddit"},
            {"text": "Sabke paas dost hain, mere paas koi nahi hai jisse share kar saku.", "source": "browser_extension_twitter"},
            {"text": "Sab kuch overwhelming lag raha hai. Bas rone ka mann karta hai har waqt.", "source": "browser_extension_instagram"},
            {"text": "Mentally exhausted ho chuka hu. Sleeping 12 hours a day still waking up drained.", "source": "web_dashboard"},
            {"text": "Exam kal subah hai and my heart is beating like crazy! Bhot nervousness ho rahi h 😰", "source": "browser_extension_reddit"},
            {"text": "React 19 release notes are out today. Looking forward to testing the compiler.", "source": "browser_extension_twitter"},
            {"text": "Yay! Finally cracked the Google Summer of Code internship! Mehnat rang layi 🎉✨", "source": "browser_extension_instagram"},
            {"text": "Had the best chai and samosa evening with my school buddies. Dil khush ho gaya ❤️", "source": "web_dashboard"}
        ]

        for p in demo_posts:
            res = predictor.analyze(p["text"])
            DatabaseService.save_analysis(user_id, p["source"], res)
    else:
        user_id = exists["user_id"]

    # Check if consumption data already exists
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as cnt FROM consumption_logs WHERE user_id = ?", (user_id,))
    cnt = cursor.fetchone()["cnt"]
    conn.close()

    if cnt > 10:
        print(f"Consumption logs already seeded ({cnt} items).")
        return

    print("Seeding Digital Consumption & Mood Intelligence data for past 7 days...")
    today = datetime.now()

    sample_articles = {
        "negative": [
            ("Catastrophic flash floods claim 45 lives in northern hills, rescue operations underway", "Disaster & Tragedy", "News & current affairs", "bbc.com", "violence/tragedy", True),
            ("Over 100 injured in violent clashes outside government building amid rising economic protests", "Politics & Conflict", "News & current affairs", "theguardian.com", "violence", True),
            ("Tragic highway collision leaves 8 dead and dozens hospitalized in critical state", "Disaster & Tragedy", "News & current affairs", "ndtv.com", "tragedy", True),
            ("Stock markets plunge 800 points as inflation fears trigger widespread layoffs across tech sector", "Finance & Economy", "News & current affairs", "reuters.com", "fear", False),
            ("Why is social media making young adults feel more isolated and depressed than ever?", "Mental Health & Wellbeing", "Social media", "reddit.com", "loneliness/depression", False),
            ("Cybersecurity breach exposes financial records of 2 million citizens in major extortion leak", "Technology & Security", "News & current affairs", "nytimes.com", "fear", False),
            ("Hospital reports critical oxygen supply shortage amid intense regional power grid failure", "Crisis & Health", "News & current affairs", "thehindu.com", "tragedy", True),
            ("Mujhe bhot hopeless lag raha hai future ko leke, jobs market bhot kharab chal rahi h", "Mental Health & Wellbeing", "Social media", "reddit.com", "loneliness/depression", False)
        ],
        "positive": [
            ("ISRO successfully deploys indigenous ocean monitoring satellite into precise orbit", "Science & Space", "News & current affairs", "indiatoday.in", "none", False),
            ("How meditation rewires the brain: 10 scientifically proven neurological benefits", "Health & Wellness", "Education", "medium.com", "none", False),
            ("Stand-up Comedy Special: Highlights from Zakir Khan's hilarious new world tour", "Entertainment & Pop Culture", "Entertainment", "youtube.com", "none", False),
            ("Cracked my dream software developer internship at Google! Mehnat rang layi 🎉", "Motivation & Growth", "Social media", "linkedin.com", "none", False),
            ("Community volunteers restore 200-year-old freshwater lake in historic conservation victory", "Environment & Uplifting", "News & current affairs", "thehindu.com", "none", False),
            ("Building an autonomous multi-agent AI system from scratch in Python (Complete Guide)", "Technology & Engineering", "Education", "youtube.com", "none", False),
            ("Wholesome rescue: Stray dog gets adopted by marathon runner during competition", "Uplifting & Animals", "Social media", "instagram.com", "none", False),
            ("Had the most peaceful evening walk after weeks of stressful exams. Feeling refreshed!", "Daily Life & Gratitude", "Social media", "twitter.com", "none", False)
        ],
        "neutral": [
            ("FastAPI vs Django in 2026: Benchmark throughput and async latency comparison", "Technology & Engineering", "Education", "youtube.com", "none", False),
            ("Understanding PostgreSQL Indexes: B-Tree, Hash, and Generalized Inverted Index (GIN)", "Technology & Engineering", "Education", "medium.com", "none", False),
            ("Central Bank announces scheduled monetary policy meeting dates for next fiscal quarter", "Finance & Policy", "News & current affairs", "reuters.com", "none", False),
            ("The history of the Silk Route and its geopolitical impact on ancient commerce", "Science & Education", "Education", "wikipedia.org", "none", False),
            ("TypeScript 5.6 announcement: Key language features and compiler speed improvements", "Technology & Engineering", "Education", "github.com", "none", False),
            ("Daily weather forecast: Mild sunshine with evening breeze expected across NCR region", "General Information", "News & current affairs", "ndtv.com", "none", False),
            ("How electric vehicle battery thermal management systems operate under extreme climates", "Science & Engineering", "Education", "youtube.com", "none", False),
            ("Overview of modern distributed consensus algorithms: Raft vs Paxos explained simply", "Technology & Engineering", "Education", "coursera.org", "none", False)
        ]
    }

    daily_plan = [
        # (days_ago, total_items, pos_count, neu_count, neg_count, mood, mood_score, note, total_seconds)
        (6, 95, 30, 48, 17, "calm", 4, "Productive workday, watched coding tutorials.", 3 * 3600 + 40 * 60),
        (5, 110, 42, 45, 23, "happy", 5, "Felt motivated and listened to uplifting podcasts.", 4 * 3600 + 10 * 60),
        (4, 140, 20, 50, 70, "stressed", 2, "Spent way too long doomscrolling breaking war and flood news.", 5 * 3600 + 15 * 60),
        (3, 105, 25, 52, 28, "anxious", 2, "Work pressure plus negative headlines made it hard to focus.", 3 * 3600 + 50 * 60),
        (2, 85, 38, 37, 10, "calm", 4, "Deliberately avoided news portals today. Read documentation instead.", 2 * 3600 + 55 * 60),
        (1, 115, 35, 55, 25, "neutral", 3, "Routine day, standard mix of entertainment and tech news.", 3 * 3600 + 45 * 60),
        (0, 126, 44, 50, 32, "stressed", 2, "Felt mentally drained after reading continuous flood & crisis news reports.", 4 * 3600 + 32 * 60)
    ]

    for days_ago, target_items, pos_target, neu_target, neg_target, mood, score, note, total_sec in daily_plan:
        d = today - timedelta(days=days_ago)
        d_str = d.strftime("%Y-%m-%d")

        # Generate items
        items = []
        # Positive
        for _ in range(pos_target):
            title, topic, cat, dom, theme, dist = random.choice(sample_articles["positive"])
            spent = random.randint(45, 250)
            items.append({
                "title": title,
                "text": title,
                "topic": topic,
                "category": cat,
                "domain": dom,
                "url": f"https://{dom}/item/{random.randint(1000, 9999)}",
                "emotional_tone": "positive",
                "emotional_intensity": random.choice(["medium", "high"]),
                "is_distressing": 0,
                "distressing_theme": "none",
                "constructiveness": random.choice(["uplifting", "supportive"]),
                "time_spent_seconds": spent,
                "date": d_str
            })

        # Neutral
        for _ in range(neu_target):
            title, topic, cat, dom, theme, dist = random.choice(sample_articles["neutral"])
            spent = random.randint(50, 280)
            items.append({
                "title": title,
                "text": title,
                "topic": topic,
                "category": cat,
                "domain": dom,
                "url": f"https://{dom}/item/{random.randint(1000, 9999)}",
                "emotional_tone": "neutral",
                "emotional_intensity": "low",
                "is_distressing": 0,
                "distressing_theme": "none",
                "constructiveness": "informative",
                "time_spent_seconds": spent,
                "date": d_str
            })

        # Negative
        for _ in range(neg_target):
            title, topic, cat, dom, theme, dist = random.choice(sample_articles["negative"])
            spent = random.randint(60, 320)
            items.append({
                "title": title,
                "text": title,
                "topic": topic,
                "category": cat,
                "domain": dom,
                "url": f"https://{dom}/item/{random.randint(1000, 9999)}",
                "emotional_tone": "negative",
                "emotional_intensity": "high" if dist else "medium",
                "is_distressing": 1 if dist else 0,
                "distressing_theme": theme,
                "constructiveness": "harmful" if "fear" in theme or "violence" in theme else "informative",
                "time_spent_seconds": spent,
                "date": d_str
            })

        # Adjust time spent scale to match target total seconds
        actual_sec = sum(x["time_spent_seconds"] for x in items)
        if actual_sec > 0:
            factor = total_sec / actual_sec
            for x in items:
                x["time_spent_seconds"] = max(15, int(x["time_spent_seconds"] * factor))

        # Save batch
        DatabaseService.save_consumption_logs_batch(user_id, items)

        # Save Mood Checkin
        DatabaseService.save_or_update_mood_checkin(
            user_id=user_id,
            mood=mood,
            mood_score=score,
            note=note,
            checkin_date=d_str
        )

    print("Successfully seeded 7 days of Digital Consumption & Mood data!")


if __name__ == "__main__":
    seed_demo_data()
