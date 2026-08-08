"""Resume template model created and maintained by administrators."""
from models import db, TimestampMixin


class ResumeTemplate(TimestampMixin, db.Model):
    """Stores reusable resume template metadata and its editable layout schema."""
    __tablename__ = "resume_templates"
    id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.Integer, db.ForeignKey("admins.id", ondelete="SET NULL"), index=True)
    name = db.Column(db.String(120), nullable=False, unique=True)
    description = db.Column(db.Text)
    accent_color = db.Column(db.String(20), nullable=False, default="#2563EB")
    layout = db.Column(db.JSON, nullable=False, default=dict)
    is_active = db.Column(db.Boolean, nullable=False, default=True)

    created_by = db.relationship("Admin", back_populates="resume_templates")

    def __repr__(self):
        return f"<ResumeTemplate {self.id}: {self.name}>"
