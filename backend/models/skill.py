"""Skill catalogue and user skill proficiency models."""
from models import db, TimestampMixin

class Skill(TimestampMixin, db.Model):
    __tablename__ = "skills"
    id = db.Column(db.Integer, primary_key=True); name = db.Column(db.String(120), nullable=False, unique=True, index=True)
    category = db.Column(db.String(100), index=True); description = db.Column(db.Text)
    user_skills = db.relationship("UserSkill", back_populates="skill", cascade="all, delete-orphan")
    def __repr__(self): return f"<Skill {self.id}: {self.name}>"

class UserSkill(TimestampMixin, db.Model):
    __tablename__ = "user_skills"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = db.Column(db.Integer, db.ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    proficiency = db.Column(db.Integer, nullable=False, default=0)
    user = db.relationship("User", backref=db.backref("skill_links", cascade="all, delete-orphan")); skill = db.relationship("Skill", back_populates="user_skills")
    __table_args__ = (db.UniqueConstraint("user_id", "skill_id", name="uq_user_skill"), db.CheckConstraint("proficiency >= 0 AND proficiency <= 100", name="ck_user_skill_proficiency"))
    def __repr__(self): return f"<UserSkill user={self.user_id} skill={self.skill_id}>"
