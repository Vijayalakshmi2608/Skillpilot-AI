"""Reusable assessment question and option models."""
from models import db, TimestampMixin

class AssessmentQuestion(TimestampMixin, db.Model):
    __tablename__ = "assessment_questions"
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.Text, nullable=False); category = db.Column(db.String(100), index=True)
    display_order = db.Column(db.Integer, nullable=False, default=0); is_active = db.Column(db.Boolean, nullable=False, default=True)
    options = db.relationship("AssessmentOption", back_populates="question", cascade="all, delete-orphan", order_by="AssessmentOption.display_order")
    def __repr__(self): return f"<AssessmentQuestion {self.id}>"

class AssessmentOption(TimestampMixin, db.Model):
    __tablename__ = "assessment_options"
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey("assessment_questions.id", ondelete="CASCADE"), nullable=False, index=True)
    option_text = db.Column(db.String(500), nullable=False); value = db.Column(db.String(120)); display_order = db.Column(db.Integer, nullable=False, default=0)
    question = db.relationship("AssessmentQuestion", back_populates="options")
    __table_args__ = (db.UniqueConstraint("question_id", "display_order", name="uq_assessment_option_order"),)
    def __repr__(self): return f"<AssessmentOption {self.id} question={self.question_id}>"
