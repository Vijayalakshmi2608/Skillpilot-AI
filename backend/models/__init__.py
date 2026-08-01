"""
models package initializer. Exposes the SQLAlchemy db instance.
Do not import models.user at module import time to avoid circular imports in some situations.
"""
from flask_sqlalchemy import SQLAlchemy

# Shared SQLAlchemy instance. Initialize with db.init_app(app) in create_app
db = SQLAlchemy()
