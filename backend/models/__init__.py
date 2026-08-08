"""Database extension, shared timestamp mixin, and model exports."""
from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class TimestampMixin:
    """Adds timezone-aware creation and modification timestamps to a model."""
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

from models.user import User  # noqa: E402,F401
from models.content import ContentItem, ContactMessage, AssessmentResult  # noqa: E402,F401
from models.student import Student  # noqa: E402,F401
from models.admin import Admin  # noqa: E402,F401
from models.career_domain import CareerDomain  # noqa: E402,F401
from models.career import Career  # noqa: E402,F401
from models.college import College  # noqa: E402,F401
from models.scholarship import Scholarship  # noqa: E402,F401
from models.assessment import Assessment  # noqa: E402,F401
from models.recommendation import Recommendation  # noqa: E402,F401
from models.roadmap import Roadmap  # noqa: E402,F401
from models.resource import Resource  # noqa: E402,F401
from models.notification import Notification  # noqa: E402,F401
from models.entrance_exam import EntranceExam  # noqa: E402,F401
from models.resume_template import ResumeTemplate  # noqa: E402,F401
from models.student_profile import StudentProfile  # noqa: E402,F401
from models.assessment_question import AssessmentQuestion, AssessmentOption  # noqa: E402,F401
from models.skill import Skill, UserSkill  # noqa: E402,F401
from models.career_roadmap import CareerRoadmap  # noqa: E402,F401
from models.feedback import Feedback  # noqa: E402,F401
from models.saved_career import SavedCareer  # noqa: E402,F401
from models.admin_log import AdminLog  # noqa: E402,F401
