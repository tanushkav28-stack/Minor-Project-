"""
Cognivibe AI - Application Configuration
"""

import os

class Settings:
    PROJECT_NAME: str = "Cognivibe AI"
    VERSION: str = "2.0.0"
    API_V1_PREFIX: str = "/api"
    
    # Secret key for JWT signing
    SECRET_KEY: str = os.getenv("SECRET_KEY", "cognivibe-secret-token-key-change-in-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database: Defaults to SQLite for immediate local execution, seamlessly supports PostgreSQL
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///{os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'cognivibe.db'))}"
    )

    # CORS
    BACKEND_CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "chrome-extension://*",
        "*"
    ]

settings = Settings()

