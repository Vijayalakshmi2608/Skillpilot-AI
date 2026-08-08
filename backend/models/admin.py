"""Administrator account model for managing catalogue content."""
from sqlalchemy.orm import validates
from models import db, TimestampMixin


class Admin(TimestampMixin, db.Model):
    """Represents an administrative user who can publish platform content."""
    __tablename__ = "admins"
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean, nullable=False, default=True)

    resume_templates = db.relationship("ResumeTemplate", back_populates="created_by")
    notifications = db.relationship("Notification", back_populates="sent_by")

    @validates("email")
    def validate_email(self, _, value):
        value = value.strip().lower()
        if "@" not in value:
            raise ValueError("A valid email address is required.")
        return value

    def __repr__(self):
        return f"<Admin {self.id}: {self.email}>"
