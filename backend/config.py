"""
Configuration for the Flask application.
Reads sensitive values from .env when available.
"""
import os
from dotenv import load_dotenv
from pathlib import Path

base_dir = Path(__file__).resolve().parent
load_dotenv(dotenv_path=base_dir / ".env")


class Config:
    """Base configuration.

    - Uses an SQLite database file inside the backend folder by default.
    - Keeps sensitive keys in .env but provides safe defaults for local development.
    """

    # Secret keys
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", os.getenv("SECRET_KEY", "change-me-in-production"))

    # SQLAlchemy settings
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Compose SQLite absolute path in this folder so frontend/backends find it reliably
    SQLITE_PATH = os.getenv("SQLITE_PATH", str(base_dir / "database.db"))
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{SQLITE_PATH}"

    # JWT settings
    JWT_TOKEN_LOCATION = ["headers"]
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 3600))  # seconds


class ProdConfig(Config):
    """Production overrides."""
    pass


class DevConfig(Config):
    """Development config."""
    DEBUG = True
