"""Application configuration loaded from environment variables."""
import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


class Config:
    ENVIRONMENT = os.getenv("FLASK_ENV", "development").lower()
    SECRET_KEY = os.getenv("SECRET_KEY")
    # An absolute SQLite path keeps the required database.db inside backend/.
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", f"sqlite:///{(BASE_DIR / 'database.db').as_posix()}")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.getenv("JWT_ACCESS_TOKEN_HOURS", "24")))
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=int(os.getenv("JWT_REFRESH_TOKEN_DAYS", "30")))
    CORS_ORIGINS = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "*").split(",")]
    JSON_SORT_KEYS = False
    JSONIFY_PRETTYPRINT_REGULAR = False
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", str(2 * 1024 * 1024)))
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    OPENROUTER_API_URL = os.getenv("OPENROUTER_API_URL", "https://openrouter.ai/api/v1/chat/completions")
    OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.1-8b-instruct:free")
    OPENROUTER_TIMEOUT = int(os.getenv("OPENROUTER_TIMEOUT", "60"))
    OPENROUTER_MAX_RETRIES = int(os.getenv("OPENROUTER_MAX_RETRIES", "3"))

    @classmethod
    def validate_security(cls):
        """Reject missing or placeholder secrets when running in production."""
        invalid = (None, "", "replace-with-a-long-random-secret", "replace-with-a-different-long-random-secret")
        if cls.ENVIRONMENT == "production" and (cls.SECRET_KEY in invalid or cls.JWT_SECRET_KEY in invalid):
            raise RuntimeError("SECRET_KEY and JWT_SECRET_KEY must be securely configured in production.")
