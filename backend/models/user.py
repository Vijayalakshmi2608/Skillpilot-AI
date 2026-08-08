"""User account model."""
from datetime import datetime, timezone
import bcrypt
from models import db


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="student")
    stream = db.Column(db.String(50))
    city = db.Column(db.String(100))
    phone = db.Column(db.String(30))
    school = db.Column(db.String(150))
    board_score = db.Column(db.String(20))
    domain = db.Column(db.String(100))
    progress = db.Column(db.Integer, default=0, nullable=False)
    saved_careers = db.Column(db.JSON, default=list, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    def check_password(self, password):
        return bcrypt.checkpw(password.encode("utf-8"), self.password_hash.encode("utf-8"))

    def to_dict(self):
        return {"id": str(self.id), "name": self.full_name, "fullName": self.full_name,
                "email": self.email, "role": self.role, "stream": self.stream or "",
                "city": self.city or "", "phone": self.phone or "", "school": self.school or "",
                "boardScore": self.board_score or "", "domain": self.domain or "", "progress": self.progress,
                "savedCareers": self.saved_careers or [], "joined": self.created_at.date().isoformat()}
