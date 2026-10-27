"""Application configuration loaded from environment variables."""
import os
from pathlib import Path
from datetime import timedelta
from urllib.parse import urlparse
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


def _database_uri() -> str:
    """Resolve relative SQLite paths next to this backend, not the process CWD."""
    configured = os.getenv("DATABASE_URL")
    default = f"sqlite:///{(BASE_DIR / 'database.db').as_posix()}"
    if not configured:
        return default
    prefix = "sqlite:///"
    if configured.startswith(prefix):
        path = configured[len(prefix):]
        if path and path != ":memory:" and not Path(path).is_absolute():
            return f"{prefix}{(BASE_DIR / path).as_posix()}"
    return configured


class Config:
    ENVIRONMENT = os.getenv("FLASK_ENV", "development").strip().lower()
    SECRET_KEY = os.getenv("SECRET_KEY")
    # An absolute SQLite path keeps the required database.db inside backend/.
    SQLALCHEMY_DATABASE_URI = _database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.getenv("JWT_ACCESS_TOKEN_HOURS", "24")))
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=int(os.getenv("JWT_REFRESH_TOKEN_DAYS", "30")))
    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if origin.strip()
    ]
    CORS_ORIGINS_CONFIGURED = bool(os.getenv("CORS_ORIGINS", "").strip())
    JSON_SORT_KEYS = False
    JSONIFY_PRETTYPRINT_REGULAR = False
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", str(2 * 1024 * 1024)))
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1").rstrip("/")
    OPENROUTER_API_URL = os.getenv("OPENROUTER_API_URL", f"{OPENROUTER_BASE_URL}/chat/completions")
    OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openrouter/auto")
    OPENROUTER_TIMEOUT = int(os.getenv("OPENROUTER_TIMEOUT", "60"))
    OPENROUTER_MAX_RETRIES = int(os.getenv("OPENROUTER_MAX_RETRIES", "3"))

    @classmethod
    def validate_security(cls):
        """Reject unsafe production secrets and overly broad CORS settings."""
        invalid = (None, "", "replace-with-a-long-random-secret", "replace-with-a-different-long-random-secret")
        if cls.ENVIRONMENT != "production":
            return

        if cls.SECRET_KEY == cls.JWT_SECRET_KEY or any(
            secret in invalid or len(secret) < 32
            for secret in (cls.SECRET_KEY, cls.JWT_SECRET_KEY)
        ):
            raise RuntimeError(
                "Production requires distinct SECRET_KEY and JWT_SECRET_KEY values "
                "of at least 32 characters."
            )

        if (
            not cls.CORS_ORIGINS_CONFIGURED
            or not cls.CORS_ORIGINS
            or any("*" in origin for origin in cls.CORS_ORIGINS)
        ):
            raise RuntimeError(
                "Production CORS_ORIGINS must be explicitly set to the exact frontend origin(s); "
                "wildcard origins are not allowed."
            )

        for origin in cls.CORS_ORIGINS:
            try:
                parsed = urlparse(origin)
                valid_origin = (
                    "*" not in origin
                    and parsed.scheme in {"http", "https"}
                    and parsed.hostname is not None
                    and parsed.username is None
                    and parsed.password is None
                    and parsed.path in {"", "/"}
                    and not parsed.query
                    and not parsed.fragment
                )
                parsed.port
            except ValueError:
                valid_origin = False
            if not valid_origin:
                raise RuntimeError(
                    "Every production CORS_ORIGINS entry must be an origin such as "
                    "https://app.example.com, without a path."
                )
