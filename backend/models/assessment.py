"""Career assessment submission model."""
from models import db, TimestampMixin


class Assessment(TimestampMixin, db.Model):
    """Stores a student's assessment answers and calculated score data."""
    __tablename__ = "assessments"
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    answers = db.Column(db.JSON, nullable=False)
    scores = db.Column(db.JSON, nullable=False, default=dict)
    completed_at = db.Column(db.DateTime(timezone=True))

    student = db.relationship("Student", back_populates="assessments")
    recommendations = db.relationship("Recommendation", back_populates="assessment", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Assessment {self.id} for student {self.student_id}>"
