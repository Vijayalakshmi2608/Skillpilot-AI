"""User feedback submitted for the platform."""
from models import db, TimestampMixin

class Feedback(TimestampMixin, db.Model):
    __tablename__ = "feedback"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), index=True)
    subject = db.Column(db.String(200)); message = db.Column(db.Text, nullable=False); rating = db.Column(db.Integer)
    status = db.Column(db.String(30), nullable=False, default="new")
    user = db.relationship("User", backref=db.backref("feedback_entries"))
    __table_args__ = (db.CheckConstraint("rating IS NULL OR (rating >= 1 AND rating <= 5)", name="ck_feedback_rating"),)
    def __repr__(self): return f"<Feedback {self.id} status={self.status}>"
