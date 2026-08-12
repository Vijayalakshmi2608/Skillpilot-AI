"""Saved careers for a User, with uniqueness enforced per user/career pair."""
from models import db, TimestampMixin

class SavedCareer(TimestampMixin, db.Model):
    __tablename__ = "saved_careers"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    career_id = db.Column(db.Integer, db.ForeignKey("careers.id", ondelete="CASCADE"), nullable=False, index=True)
    user = db.relationship("User", backref=db.backref("saved_career_links", cascade="all, delete-orphan")); career = db.relationship("Career")
    __table_args__ = (db.UniqueConstraint("user_id", "career_id", name="uq_saved_career"),)
    def __repr__(self): return f"<SavedCareer user={self.user_id} career={self.career_id}>"
