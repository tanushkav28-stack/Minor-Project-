-- ====================================================================
-- Cognivibe AI (MannSetu AI) Database Schema
-- Compatible with PostgreSQL 14+ and SQLite 3+
-- ====================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    extension_token VARCHAR(128) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. User Consent & Privacy Settings
CREATE TABLE IF NOT EXISTS user_consent (
    consent_id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    consent_type VARCHAR(64) DEFAULT 'full_analysis',
    consent_status SMALLINT DEFAULT 1,
    retention_days INT DEFAULT 30,
    allow_extension_analysis SMALLINT DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_consent_user FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. Analysis History
CREATE TABLE IF NOT EXISTS analysis_history (
    analysis_id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    source_type VARCHAR(64) DEFAULT 'web_dashboard',
    input_text TEXT NOT NULL,
    normalized_text TEXT NOT NULL,
    is_code_mixed SMALLINT DEFAULT 0,
    uncertainty_score REAL DEFAULT 0.0,
    is_uncertain SMALLINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_analysis_user FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 4. Emotion Predictions (Task 1 Head)
CREATE TABLE IF NOT EXISTS emotion_predictions (
    prediction_id VARCHAR(64) PRIMARY KEY,
    analysis_id VARCHAR(64) NOT NULL,
    predicted_emotion VARCHAR(64) NOT NULL,
    confidence_score REAL NOT NULL,
    probability_details TEXT NOT NULL,
    CONSTRAINT fk_emotion_analysis FOREIGN KEY(analysis_id) REFERENCES analysis_history(analysis_id) ON DELETE CASCADE
);

-- 5. Depression Language Predictions (Task 2 Head)
CREATE TABLE IF NOT EXISTS depression_predictions (
    prediction_id VARCHAR(64) PRIMARY KEY,
    analysis_id VARCHAR(64) NOT NULL,
    depression_related SMALLINT NOT NULL,
    predicted_indicator VARCHAR(64) NOT NULL,
    confidence_score REAL NOT NULL,
    probability_details TEXT NOT NULL,
    is_crisis SMALLINT DEFAULT 0,
    CONSTRAINT fk_depression_analysis FOREIGN KEY(analysis_id) REFERENCES analysis_history(analysis_id) ON DELETE CASCADE
);

-- 6. Generated Reports
CREATE TABLE IF NOT EXISTS reports (
    report_id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    report_type VARCHAR(64) DEFAULT 'summary',
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    summary_json TEXT NOT NULL,
    CONSTRAINT fk_report_user FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 7. Extension Connections
CREATE TABLE IF NOT EXISTS extension_connections (
    connection_id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    browser_type VARCHAR(64) DEFAULT 'Chrome',
    connection_token VARCHAR(128) NOT NULL,
    connection_status VARCHAR(32) DEFAULT 'active',
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_conn_user FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_ext_token ON users(extension_token);
CREATE INDEX IF NOT EXISTS idx_analysis_user_id ON analysis_history(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_created_at ON analysis_history(created_at);
CREATE INDEX IF NOT EXISTS idx_emotion_analysis_id ON emotion_predictions(analysis_id);
CREATE INDEX IF NOT EXISTS idx_depression_analysis_id ON depression_predictions(analysis_id);

