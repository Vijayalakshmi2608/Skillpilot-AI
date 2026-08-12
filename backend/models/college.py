"""College model, linked to a career domain and supported careers."""
from sqlalchemy.orm import validates
from sqlalchemy.orm import synonym
from models import db, TimestampMixin
from models.career import career_colleges


class College(TimestampMixin, db.Model):
    """Stores institution details used by the college finder."""
    __tablename__ = "colleges"
    id = db.Column(db.Integer, primary_key=True)
    domain_id = db.Column(db.Integer, db.ForeignKey("career_domains.id"), index=True)
    name = db.Column(db.String(200), nullable=False, unique=True)
    state = db.Column(db.String(100), nullable=False, index=True)
    district = db.Column(db.String(100))
    college_type = db.Column(db.String(30), nullable=False)
    fees = db.Column(db.Numeric(12, 2))
    placement_percentage = db.Column(db.Float)
    rating = db.Column(db.Float)
    courses = db.Column(db.JSON, nullable=False, default=list)
    cutoff = db.Column(db.String(100))
    website = db.Column(db.String(500))
    is_active = db.Column(db.Boolean, nullable=False, default=True)

    domain = db.relationship("CareerDomain", back_populates="colleges")
    careers = db.relationship("Career", secondary=career_colleges, back_populates="colleges")
    type = synonym("college_type")

    @validates("rating")
    def validate_rating(self, _, value):
        if value is not None and not 0 <= value <= 5:
            raise ValueError("Rating must be between 0 and 5.")
        return value

    @validates("placement_percentage")
    def validate_placement(self, _, value):
        if value is not None and not 0 <= value <= 100:
            raise ValueError("Placement percentage must be between 0 and 100.")
        return value

    def __repr__(self):
        return f"<College {self.id}: {self.name}>"
