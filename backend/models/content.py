"""Flexible models for frontend catalogue data and user activity."""
from datetime import datetime, timezone
from models import db


class ContentItem(db.Model):
    __tablename__ = "content_items"
    id = db.Column(db.Integer, primary_key=True)
    resource_type = db.Column(db.String(40), nullable=False, index=True)
    data = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {"id": str(self.id), **self.data}


class ContactMessage(db.Model):
    __tablename__ = "contact_messages"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default="new", nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {"id": str(self.id), "name": self.name, "email": self.email, "subject": self.subject,
                "message": self.message, "status": self.status, "createdAt": self.created_at.isoformat()}


class AssessmentResult(db.Model):
    __tablename__ = "assessment_results"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    answers = db.Column(db.JSON, nullable=False)
    result = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self):
        return {"id": str(self.id), "answers": self.answers, "result": self.result, "createdAt": self.created_at.isoformat()}

