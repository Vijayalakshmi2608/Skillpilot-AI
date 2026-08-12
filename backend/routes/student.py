"""Protected User-based student profile, saved-career, roadmap, and notification APIs."""
from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError

from models import Career, CareerRoadmap, Notification, SavedCareer, StudentProfile, User, db
from routes import ok, json_body
from utils.decorators import roles_required
from utils.responses import error_response


student_bp = Blueprint("student", __name__, url_prefix="/api/students")


def _current_student():
    """Resolve the User identified by the JWT; never trust a client user id."""
    try:
        user = db.session.get(User, int(get_jwt_identity()))
    except (TypeError, ValueError):
        return None
    return user if user and user.role == "student" else None


def _profile_payload(user):
    profile = user.student_profile
    return {
        "id": user.id, "fullName": user.full_name, "email": user.email,
        "phone": user.phone, "city": user.city, "school": user.school,
        "stream": user.stream, "boardScore": user.board_score,
        "profile": None if profile is None else {
            "schoolName": profile.school_name, "district": profile.district,
            "state": profile.state, "class": profile.student_class, "board": profile.board,
            "gender": profile.gender, "category": profile.category,
            "familyIncome": float(profile.family_income) if profile.family_income is not None else None,
        },
    }


@student_bp.route("/me", methods=["GET", "PATCH"])
@roles_required("student")
def profile():
    user = _current_student()
    if not user:
        return error_response("Student account not found.", 404)
    if request.method == "PATCH":
        data, error = json_body()
        if error:
            return error
        user_fields = {
            "fullName": "full_name", "phone": "phone", "city": "city",
            "school": "school", "stream": "stream", "boardScore": "board_score",
            "domain": "domain",
        }
        for source, target in user_fields.items():
            if source in data:
                if not isinstance(data[source], str):
                    return error_response(f"{source} must be a string.", 400)
                setattr(user, target, data[source].strip())
        profile_fields = {
            "schoolName": "school_name", "district": "district", "state": "state",
            "class": "student_class", "board": "board", "gender": "gender", "category": "category",
        }
        profile_data = {source: data[source] for source in profile_fields if source in data}
        if profile_data:
            if any(not isinstance(value, str) for value in profile_data.values()):
                return error_response("Profile fields must be strings.", 400)
            profile = user.student_profile
            if profile is None:
                profile = StudentProfile(user_id=user.id)
                db.session.add(profile)
            for source, value in profile_data.items():
                setattr(profile, profile_fields[source], value.strip())
        try:
            db.session.commit()
        except SQLAlchemyError:
            db.session.rollback()
            return error_response("Unable to update student profile.", 500)
    return ok(_profile_payload(user))


@student_bp.get("/me/recommendations")
@roles_required("student")
def recommendations():
    user = _current_student()
    if not user:
        return error_response("Student account not found.", 404)
    rows = SavedCareer.query.filter_by(user_id=user.id).join(Career).order_by(SavedCareer.created_at.desc()).all()
    return ok([{
        "id": item.id, "careerId": item.career_id, "title": item.career.title,
        "matchScore": None, "rationale": "Saved by the student.", "saved": True,
    } for item in rows])


@student_bp.get("/me/roadmaps")
@roles_required("student")
def roadmaps():
    user = _current_student()
    if not user:
        return error_response("Student account not found.", 404)
    rows = CareerRoadmap.query.filter_by(user_id=user.id).order_by(CareerRoadmap.created_at.desc()).all()
    return ok([{
        "id": item.id, "careerId": item.career_id, "title": item.title,
        "milestones": item.milestones, "progress": item.progress, "completed": item.is_completed,
    } for item in rows])


@student_bp.get("/me/notifications")
@roles_required("student")
def notifications():
    # Notification currently belongs to the legacy Student model.  Global notices
    # are still safe and relevant to every authenticated User-based student.
    rows = Notification.query.filter(Notification.student_id.is_(None)).order_by(Notification.created_at.desc()).all()
    return ok([{
        "id": item.id, "title": item.title, "message": item.message,
        "type": item.notification_type, "read": item.is_read,
    } for item in rows])
