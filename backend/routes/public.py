"""Unauthenticated utility endpoints."""
from flask import Blueprint
from models import db, ContactMessage
from utils.api import success, payload

public_bp = Blueprint("public", __name__, url_prefix="/api")


@public_bp.get("/health")
def health():
    return success({"status": "healthy"}, "SkillPilot API is running.")


@public_bp.post("/contact")
def contact():
    data, error = payload(("name", "email", "subject", "message"))
    if error:
        return error
    if len(data["message"].strip()) < 10:
        return {"success": False, "error": "Message must be at least 10 characters."}, 400
    message = ContactMessage(name=data["name"].strip(), email=data["email"].strip().lower(), subject=data["subject"].strip(), message=data["message"].strip())
    db.session.add(message)
    db.session.commit()
    return success(message.to_dict(), "Message received.", 201)
