"""Career domain model, the parent classification for careers and resources."""
from sqlalchemy.orm import validates
from models import db, TimestampMixin


class CareerDomain(TimestampMixin, db.Model):
    """Groups related careers, colleges, resources, and entrance exams."""
    __tablename__ = "career_domains"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True, index=True)
    slug = db.Column(db.String(120), nullable=False, unique=True, index=True)
    description = db.Column(db.Text, nullable=False)
    icon = db.Column(db.String(80))
    is_active = db.Column(db.Boolean, nullable=False, default=True)

    careers = db.relationship("Career", back_populates="domain", cascade="all, delete-orphan")
    colleges = db.relationship("College", back_populates="domain")
    resources = db.relationship("Resource", back_populates="domain")
    entrance_exams = db.relationship("EntranceExam", back_populates="domain")

    @validates("slug")
    def validate_slug(self, _, value):
        value = value.strip().lower()
        if not value or " " in value:
            raise ValueError("Slug must be lowercase and contain no spaces.")
        return value

    def __repr__(self):
        return f"<CareerDomain {self.id}: {self.slug}>"
