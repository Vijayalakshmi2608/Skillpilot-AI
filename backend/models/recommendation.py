"""Personalised career recommendation model."""
from sqlalchemy import CheckConstraint
from models import db, TimestampMixin


class Recommendation(TimestampMixin, db.Model):
    """Links a student assessment to a career with an explainable match score."""
    __tablename__ = "recommendations"
    __table_args__ = (CheckConstraint("match_score >= 0 AND match_score <= 100", name="ck_recommendation_match_score"),)
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    assessment_id = db.Column(db.Integer, db.ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    career_id = db.Column(db.Integer, db.ForeignKey("careers.id"), nullable=False, index=True)
    match_score = db.Column(db.Float, nullable=False)
    rationale = db.Column(db.Text)
    is_saved = db.Column(db.Boolean, nullable=False, default=False)

    student = db.relationship("Student", back_populates="recommendations")
    assessment = db.relationship("Assessment", back_populates="recommendations")
    career = db.relationship("Career", back_populates="recommendations")

    def __repr__(self):
        return f"<Recommendation {self.id}: {self.match_score}%>"
