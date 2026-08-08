"""Extended educational and demographic information for a User."""
from models import db, TimestampMixin

class StudentProfile(TimestampMixin, db.Model):
    __tablename__ = "student_profiles"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    school_name = db.Column(db.String(180)); district = db.Column(db.String(100)); state = db.Column(db.String(100), index=True)
    student_class = db.Column("class", db.String(30)); board = db.Column(db.String(80)); gender = db.Column(db.String(30))
    date_of_birth = db.Column(db.Date); family_income = db.Column(db.Numeric(14, 2)); category = db.Column(db.String(80), index=True)
    user = db.relationship("User", backref=db.backref("student_profile", uselist=False, cascade="all, delete-orphan"))
    def __repr__(self): return f"<StudentProfile {self.id} user={self.user_id}>"
