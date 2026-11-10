"""
Cognivibe AI - Database Seeder
Seeds an initial demo user and realistic browsing analysis history for instant demonstration.
"""

import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.core.security import hash_password
from backend.app.database.session import DatabaseService, get_db_connection
from ml_engine.inference.predictor import predictor


def seed_demo_data():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT user_id FROM users WHERE email = 'demo@cognivibe.ai'")
    exists = cursor.fetchone()
    conn.close()

    if exists:
        print("Demo user already exists.")
        return

    print("Seeding demo account: demo@cognivibe.ai / password123")
    user = DatabaseService.create_user(
        name="Aarav Sharma",
        email="demo@cognivibe.ai",
        password_hash=hash_password("password123")
    )

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
        DatabaseService.save_analysis(user["user_id"], p["source"], res)

    print("Demo data seeded successfully with realistic Hinglish analysis history!")


if __name__ == "__main__":
    seed_demo_data()

