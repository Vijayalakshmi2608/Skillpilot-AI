"""JWT identifiers revoked by logout, kept in the existing SQLite database."""
from datetime import datetime, timezone
from models import db


class RevokedToken(db.Model):
    __tablename__ = "revoked_tokens"
    jti = db.Column(db.String(36), primary_key=True)
    token_type = db.Column(db.String(10), nullable=False)
    expires_at = db.Column(db.DateTime(timezone=True), nullable=True)
    revoked_at = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
