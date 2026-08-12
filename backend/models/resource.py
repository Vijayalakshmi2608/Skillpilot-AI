"""Learning resource model for articles, courses, videos, and other material."""
from sqlalchemy.orm import validates
from models import db, TimestampMixin


class Resource(TimestampMixin, db.Model):
    """Stores a curated learning resource associated with an optional domain."""
    __tablename__ = "resources"
    id = db.Column(db.Integer, primary_key=True)
    domain_id = db.Column(db.Integer, db.ForeignKey("career_domains.id"), index=True)
    title = db.Column(db.String(200), nullable=False)
    resource_type = db.Column(db.String(30), nullable=False)
    level = db.Column(db.String(30), nullable=False, default="Beginner")
    provider = db.Column(db.String(120))
    url = db.Column(db.String(500), nullable=False)
    duration_minutes = db.Column(db.Integer)
    rating = db.Column(db.Float)
    description = db.Column(db.Text)
    is_published = db.Column(db.Boolean, nullable=False, default=True)

    domain = db.relationship("CareerDomain", back_populates="resources")

    @validates("url")
    def validate_url(self, _, value):
        if not value.startswith(("https://", "http://")):
            raise ValueError("Resource URL must use HTTP or HTTPS.")
        return value

    @validates("rating")
    def validate_rating(self, _, value):
        if value is not None and not 0 <= value <= 5:
            raise ValueError("Rating must be between 0 and 5.")
        return value

    def __repr__(self):
        return f"<Resource {self.id}: {self.title}>"
