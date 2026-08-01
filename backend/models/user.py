"""
User model for authentication and basic user data.
"""
from datetime import datetime
from models import db


class User(db.Model):
    """User table.

    Fields:
        id: primary key
        username: unique username
        email: unique email
        password_hash: bcrypt hashed password
        created_at: timestamp when account was created
    """

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.LargeBinary(60), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        """Return a dict suitable for JSON responses (excluding password)."""
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "created_at": self.created_at.isoformat(),
        }

    def __repr__(self):
        return f"<User id={self.id} username={self.username}>"
