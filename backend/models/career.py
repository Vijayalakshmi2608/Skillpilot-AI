"""Career model and its many-to-many college association."""
from sqlalchemy.orm import validates
from sqlalchemy.orm import synonym
from models import db, TimestampMixin

career_colleges = db.Table(
    "career_colleges",
    db.Column("career_id", db.Integer, db.ForeignKey("careers.id", ondelete="CASCADE"), primary_key=True),
    db.Column("college_id", db.Integer, db.ForeignKey("colleges.id", ondelete="CASCADE"), primary_key=True),
)


class Career(TimestampMixin, db.Model):
    """Stores detailed information about a career path within a domain."""
    __tablename__ = "careers"
    id = db.Column(db.Integer, primary_key=True)
    domain_id = db.Column(db.Integer, db.ForeignKey("career_domains.id"), nullable=False, index=True)
    title = db.Column(db.String(150), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=False)
    salary_range = db.Column(db.String(100))
    demand_score = db.Column(db.Integer, nullable=False, default=0)
    growth_rate = db.Column(db.Float, nullable=False, default=0)
    skills = db.Column(db.JSON, nullable=False, default=list)
    education_path = db.Column(db.JSON, nullable=False, default=list)
    eligibility = db.Column(db.Text)
    is_active = db.Column(db.Boolean, nullable=False, default=True)

    domain = db.relationship("CareerDomain", back_populates="careers")
    colleges = db.relationship("College", secondary=career_colleges, back_populates="careers")
    recommendations = db.relationship("Recommendation", back_populates="career")
    roadmaps = db.relationship("Roadmap", back_populates="career")
    required_skills = synonym("skills")
    average_salary = synonym("salary_range")

    @validates("demand_score")
    def validate_demand_score(self, _, value):
        if not 0 <= value <= 100:
            raise ValueError("Demand score must be between 0 and 100.")
        return value

    def __repr__(self):
        return f"<Career {self.id}: {self.title}>"
