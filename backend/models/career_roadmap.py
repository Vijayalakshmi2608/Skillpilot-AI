"""User-selected long-term career roadmap model."""
from models import db, TimestampMixin

class CareerRoadmap(TimestampMixin, db.Model):
    __tablename__ = "career_roadmaps"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    career_id = db.Column(db.Integer, db.ForeignKey("careers.id", ondelete="CASCADE"), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False); milestones = db.Column(db.JSON, nullable=False, default=list)
    progress = db.Column(db.Integer, nullable=False, default=0); is_completed = db.Column(db.Boolean, nullable=False, default=False)
    user = db.relationship("User", backref=db.backref("career_roadmaps", cascade="all, delete-orphan")); career = db.relationship("Career")
    __table_args__ = (db.CheckConstraint("progress >= 0 AND progress <= 100", name="ck_career_roadmap_progress"),)
    def __repr__(self): return f"<CareerRoadmap {self.id} user={self.user_id}>"
