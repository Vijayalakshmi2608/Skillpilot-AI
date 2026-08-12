"""In-app notification model with sender and recipient relationships."""
from models import db, TimestampMixin


class Notification(TimestampMixin, db.Model):
    """Represents a notification sent by an admin to a student or all students."""
    __tablename__ = "notifications"
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id", ondelete="CASCADE"), index=True)
    admin_id = db.Column(db.Integer, db.ForeignKey("admins.id", ondelete="SET NULL"), index=True)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    notification_type = db.Column(db.String(30), nullable=False, default="system")
    is_read = db.Column(db.Boolean, nullable=False, default=False)
    # Legacy SQLite columns retained so pre-existing databases remain writable.
    # They mirror the current fields until a managed migration can remove them.
    legacy_type = db.Column("type", db.String(30), nullable=False, default="system")
    legacy_read = db.Column("read", db.Boolean, nullable=False, default=False)
    read_at = db.Column(db.DateTime(timezone=True))

    student = db.relationship("Student", back_populates="notifications")
    sent_by = db.relationship("Admin", back_populates="notifications")

    def __repr__(self):
        return f"<Notification {self.id}: {self.notification_type}>"
