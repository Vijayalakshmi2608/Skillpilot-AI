"""Student-specific action roadmap model."""
from sqlalchemy.orm import validates
from models import db, TimestampMixin


class Roadmap(TimestampMixin, db.Model):
    """Stores a sequenced learning and application plan for a chosen career."""
    __tablename__ = "roadmaps"
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    career_id = db.Column(db.Integer, db.ForeignKey("careers.id"), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    milestones = db.Column(db.JSON, nullable=False, default=list)
    progress = db.Column(db.Integer, nullable=False, default=0)
    is_completed = db.Column(db.Boolean, nullable=False, default=False)

    student = db.relationship("Student", back_populates="roadmaps")
    career = db.relationship("Career", back_populates="roadmaps")

    @validates("progress")
    def validate_progress(self, _, value):
        if not 0 <= value <= 100:
            raise ValueError("Progress must be between 0 and 100.")
        return value

    def __repr__(self):
        return f"<Roadmap {self.id}: {self.title}>"
