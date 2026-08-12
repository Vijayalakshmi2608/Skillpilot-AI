"""Scholarship model with eligibility and application information."""
from sqlalchemy.orm import validates
from sqlalchemy.orm import synonym
from models import db, TimestampMixin


class Scholarship(TimestampMixin, db.Model):
    """Represents a scholarship available to eligible students."""
    __tablename__ = "scholarships"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False, unique=True)
    provider = db.Column(db.String(150), nullable=False)
    amount = db.Column(db.Numeric(12, 2))
    deadline = db.Column(db.Date)
    category = db.Column(db.String(100), nullable=False)
    eligibility = db.Column(db.JSON, nullable=False, default=list)
    benefits = db.Column(db.JSON, nullable=False, default=list)
    application_url = db.Column(db.String(500))
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    title = synonym("name")
    last_date = synonym("deadline")
    website = synonym("application_url")

    @validates("application_url")
    def validate_url(self, _, value):
        if value and not value.startswith(("https://", "http://")):
            raise ValueError("Application URL must use HTTP or HTTPS.")
        return value

    def __repr__(self):
        return f"<Scholarship {self.id}: {self.name}>"
