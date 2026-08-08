"""Student profile model and its relationships to personalised data."""
from sqlalchemy.orm import validates
from models import db, TimestampMixin


class Student(TimestampMixin, db.Model):
    """Represents a student using the career guidance platform."""
    __tablename__ = "students"
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(25), unique=True)
    city = db.Column(db.String(100))
    school = db.Column(db.String(150))
    stream = db.Column(db.String(50))
    board_score = db.Column(db.Float)
    is_active = db.Column(db.Boolean, nullable=False, default=True)

    assessments = db.relationship("Assessment", back_populates="student", cascade="all, delete-orphan")
    recommendations = db.relationship("Recommendation", back_populates="student", cascade="all, delete-orphan")
    roadmaps = db.relationship("Roadmap", back_populates="student", cascade="all, delete-orphan")
    notifications = db.relationship("Notification", back_populates="student", cascade="all, delete-orphan")

    @validates("email")
    def validate_email(self, _, value):
        value = value.strip().lower()
        if "@" not in value or value.startswith("@"):
            raise ValueError("A valid email address is required.")
        return value

    @validates("board_score")
    def validate_score(self, _, value):
        if value is not None and not 0 <= value <= 100:
            raise ValueError("Board score must be between 0 and 100.")
        return value

    def __repr__(self):
        return f"<Student {self.id}: {self.email}>"
