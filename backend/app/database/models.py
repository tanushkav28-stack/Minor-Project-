"""
Cognivibe AI - Database Models (Step 10 Database Design)
PostgreSQL and SQLite compatible schema with foreign keys, indexes, and privacy retention controls.
"""

from datetime import datetime
import json
import uuid


def generate_uuid() -> str:
    return str(uuid.uuid4())


# Schema definition in pure SQL / Python dataclasses for zero-setup execution
SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    extension_token TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_consent (
    consent_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    consent_type TEXT DEFAULT 'full_analysis',
    consent_status INTEGER DEFAULT 1,
    retention_days INTEGER DEFAULT 30,
    allow_extension_analysis INTEGER DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS analysis_history (
    analysis_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    source_type TEXT DEFAULT 'web_dashboard',
    input_text TEXT NOT NULL,
    normalized_text TEXT NOT NULL,
    is_code_mixed INTEGER DEFAULT 0,
    uncertainty_score REAL DEFAULT 0.0,
    is_uncertain INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS emotion_predictions (
    prediction_id TEXT PRIMARY KEY,
    analysis_id TEXT NOT NULL,
    predicted_emotion TEXT NOT NULL,
    confidence_score REAL NOT NULL,
    probability_details TEXT NOT NULL,
    FOREIGN KEY(analysis_id) REFERENCES analysis_history(analysis_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS depression_predictions (
    prediction_id TEXT PRIMARY KEY,
    analysis_id TEXT NOT NULL,
    depression_related INTEGER NOT NULL,
    predicted_indicator TEXT NOT NULL,
    confidence_score REAL NOT NULL,
    probability_details TEXT NOT NULL,
    is_crisis INTEGER DEFAULT 0,
    FOREIGN KEY(analysis_id) REFERENCES analysis_history(analysis_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reports (
    report_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    report_type TEXT DEFAULT 'summary',
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    summary_json TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS extension_connections (
    connection_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    browser_type TEXT DEFAULT 'Chrome',
    connection_token TEXT NOT NULL,
    connection_status TEXT DEFAULT 'active',
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Digital Consumption & Mood Intelligence Tracker Schema
CREATE TABLE IF NOT EXISTS consumption_logs (
    log_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    url TEXT,
    domain TEXT,
    platform TEXT DEFAULT 'Web',
    category TEXT DEFAULT 'Other',
    title TEXT,
    content_snippet TEXT,
    emotional_tone TEXT DEFAULT 'neutral', -- positive, neutral, negative, mixed
    topic TEXT DEFAULT 'General',
    emotional_intensity TEXT DEFAULT 'medium', -- low, medium, high
    is_distressing INTEGER DEFAULT 0,
    distressing_theme TEXT DEFAULT 'none',
    constructiveness TEXT DEFAULT 'informative', -- informative, supportive, harmful, uplifting, unclear
    time_spent_seconds INTEGER DEFAULT 0,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date TEXT NOT NULL, -- YYYY-MM-DD
    FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mood_checkins (
    checkin_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    mood TEXT NOT NULL, -- happy, calm, neutral, stressed, sad, anxious
    mood_score INTEGER NOT NULL, -- 1 (sad), 2 (stressed/anxious), 3 (neutral), 4 (calm), 5 (happy)
    note TEXT,
    checkin_date TEXT NOT NULL, -- YYYY-MM-DD
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_analysis_user_id ON analysis_history(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_created_at ON analysis_history(created_at);
CREATE INDEX IF NOT EXISTS idx_consumption_user_date ON consumption_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_mood_user_date ON mood_checkins(user_id, checkin_date);
"""

