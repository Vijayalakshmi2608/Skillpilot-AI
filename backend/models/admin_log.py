"""Immutable audit log for actions performed by administrator Users."""
from models import db, TimestampMixin

class AdminLog(TimestampMixin, db.Model):
    __tablename__ = "admin_logs"
    id = db.Column(db.Integer, primary_key=True)
    admin_user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), index=True)
    action = db.Column(db.String(120), nullable=False, index=True); entity_type = db.Column(db.String(100)); entity_id = db.Column(db.Integer)
    details = db.Column(db.JSON, nullable=False, default=dict)
    admin_user = db.relationship("User", backref=db.backref("admin_logs"))
    def __repr__(self): return f"<AdminLog {self.id}: {self.action}>"
