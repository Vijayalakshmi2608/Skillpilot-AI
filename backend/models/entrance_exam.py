"""Entrance examination model associated with a primary career domain."""
from sqlalchemy.orm import validates
from models import db, TimestampMixin


class EntranceExam(TimestampMixin, db.Model):
    """Stores application and schedule information for an entrance examination."""
    __tablename__ = "entrance_exams"
    id = db.Column(db.Integer, primary_key=True)
    domain_id = db.Column(db.Integer, db.ForeignKey("career_domains.id"), nullable=False, index=True)
    name = db.Column(db.String(150), nullable=False, unique=True)
    conducting_body = db.Column(db.String(150), nullable=False)
    level = db.Column(db.String(50), nullable=False)
    mode = db.Column(db.String(30), nullable=False)
    exam_date = db.Column(db.Date)
    registration_deadline = db.Column(db.Date)
    seats = db.Column(db.Integer)
    official_url = db.Column(db.String(500))
    is_active = db.Column(db.Boolean, nullable=False, default=True)

    domain = db.relationship("CareerDomain", back_populates="entrance_exams")

    @validates("official_url")
    def validate_url(self, _, value):
        if value and not value.startswith(("https://", "http://")):
            raise ValueError("Official URL must use HTTP or HTTPS.")
        return value

    def __repr__(self):
        return f"<EntranceExam {self.id}: {self.name}>"
