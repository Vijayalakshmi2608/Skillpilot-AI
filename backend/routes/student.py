"""Protected User-based student profile, saved-career, roadmap, and notification APIs."""
from datetime import date
from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from models import AssessmentResult, Career, CareerRoadmap, EntranceExam, Notification, SavedCareer, Scholarship, StudentProfile, User, db
from routes import ok, json_body
from utils.decorators import roles_required
from utils.responses import error_response
from utils.validators import validate_email, validate_string


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
        if not data:
            return error_response("At least one profile field is required.", 400)
        user_fields = {
            "fullName": "full_name", "email": "email", "phone": "phone", "city": "city",
            "school": "school", "stream": "stream", "boardScore": "board_score",
            "domain": "domain",
        }
        profile_fields = {
            "schoolName": ("school_name", 180), "district": ("district", 100), "state": ("state", 100),
            "class": ("student_class", 30), "board": ("board", 80), "gender": ("gender", 30), "category": ("category", 80),
        }
        allowed_fields = set(user_fields) | set(profile_fields) | {"familyIncome"}
        unknown = set(data) - allowed_fields
        if unknown:
            return error_response("Unknown profile field.", 400, {key: "This field is not editable." for key in sorted(unknown)})
        for source, target in user_fields.items():
            if source in data:
                value = data[source]
                if source == "email":
                    if validate_email(value):
                        return error_response("Validation failed.", 400, {source: "Enter a valid email address."})
                    value = value.strip().lower()
                    if User.query.filter(User.email == value, User.id != user.id).first():
                        return error_response("Email is already registered.", 409, {source: "Email is already registered."})
                else:
                    message = validate_string(value, source, 0 if source == "phone" else 1,
                                              30 if source == "phone" else {"fullName": 120, "city": 100, "school": 150, "stream": 50, "boardScore": 20, "domain": 100}[source])
                    if message:
                        return error_response("Validation failed.", 400, {source: message})
                    value = value.strip() or None
                setattr(user, target, value)
        profile_data = {source: data[source] for source in profile_fields if source in data}
        if profile_data:
            profile = user.student_profile
            if profile is None:
                profile = StudentProfile(user=user)
                db.session.add(profile)
            for source, value in profile_data.items():
                target, maximum = profile_fields[source]
                message = validate_string(value, source, 0, maximum)
                if message:
                    return error_response("Validation failed.", 400, {source: message})
                setattr(profile, target, value.strip() or None)
        if "familyIncome" in data:
            value = data["familyIncome"]
            if isinstance(value, bool) or not isinstance(value, (int, float)) or value < 0 or value > 999999999999:
                return error_response("Validation failed.", 400, {"familyIncome": "Must be a non-negative number."})
            profile = user.student_profile
            if profile is None:
                profile = StudentProfile(user=user)
                db.session.add(profile)
            profile.family_income = value
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return error_response("Email is already registered.", 409)
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


@student_bp.get("/me/dashboard")
@roles_required("student")
def dashboard():
    user = _current_student()
    if not user:
        return error_response("Student account not found.", 404)

    profile_values = [
        user.full_name, user.email, user.phone, user.city, user.school, user.stream,
        user.board_score, user.student_profile.student_class if user.student_profile else None,
        user.student_profile.board if user.student_profile else None,
        user.student_profile.state if user.student_profile else None,
    ]
    profile_completion = round(sum(bool(value and str(value).strip()) for value in profile_values) / len(profile_values) * 100)
    latest = AssessmentResult.query.filter_by(user_id=user.id).order_by(AssessmentResult.created_at.desc()).first()
    recommendations = []
    if latest and isinstance(latest.result, dict):
        recommendation_data = latest.result.get("recommendations", [])
        if isinstance(recommendation_data, list):
            career_ids = [item.get("id") for item in recommendation_data if isinstance(item, dict) and isinstance(item.get("id"), int)]
            careers_by_id = {
                career.id: career for career in Career.query.filter(Career.id.in_(career_ids), Career.is_active.is_(True)).all()
            } if career_ids else {}
            recommendations = [{
                "id": careers_by_id[item["id"]].id,
                "title": careers_by_id[item["id"]].title,
                "domain": careers_by_id[item["id"]].domain.name,
                "description": careers_by_id[item["id"]].description,
                "salaryRange": careers_by_id[item["id"]].salary_range,
                "growthRate": careers_by_id[item["id"]].growth_rate,
                "demandScore": careers_by_id[item["id"]].demand_score,
                "skills": careers_by_id[item["id"]].skills or [],
                "matchScore": item.get("matchScore"),
            } for item in recommendation_data
                if isinstance(item, dict) and isinstance(item.get("id"), int) and item["id"] in careers_by_id]

    saved_careers = SavedCareer.query.filter_by(user_id=user.id).join(Career).order_by(SavedCareer.created_at.desc()).all()
    roadmaps = CareerRoadmap.query.filter_by(user_id=user.id).order_by(CareerRoadmap.updated_at.desc()).all()
    notices = Notification.query.filter(Notification.student_id.is_(None)).order_by(Notification.created_at.desc()).limit(5).all()
    upcoming_exams = EntranceExam.query.filter(
        EntranceExam.is_active.is_(True),
        EntranceExam.exam_date.isnot(None),
        EntranceExam.exam_date >= date.today(),
    ).order_by(EntranceExam.exam_date.asc()).limit(4).all()
    scholarships = Scholarship.query.filter_by(is_active=True).order_by(Scholarship.deadline.asc()).limit(3).all()
    activity = []
    if latest:
        activity.append({
            "id": f"assessment-{latest.id}", "title": "Career assessment completed",
            "detail": "Your latest assessment results are saved.", "createdAt": latest.created_at.isoformat(),
        })
    activity.extend({
        "id": f"career-{item.id}", "title": f"Saved {item.career.title}",
        "detail": f"Career in {item.career.domain.name}.", "createdAt": item.created_at.isoformat(),
    } for item in saved_careers)
    activity.extend({
        "id": f"roadmap-{item.id}", "title": f"Saved {item.title} roadmap",
        "detail": f"Roadmap progress: {item.progress}%.", "createdAt": item.updated_at.isoformat(),
    } for item in roadmaps)
    activity.sort(key=lambda item: item["createdAt"], reverse=True)
    return ok({
        "user": {"fullName": user.full_name},
        "stats": {
            "profileCompletion": profile_completion,
            "hasAssessment": latest is not None,
            "savedCareers": len(saved_careers),
            "roadmaps": len(roadmaps),
        },
        "latestAssessment": None if latest is None else {
            "createdAt": latest.created_at.isoformat(),
            "scores": latest.result.get("scores", {}) if isinstance(latest.result, dict) else {},
            "recommendations": recommendations,
        },
        "savedCareers": [{
            "id": item.career.id, "title": item.career.title, "domain": item.career.domain.name,
            "description": item.career.description, "salaryRange": item.career.salary_range,
            "growthRate": item.career.growth_rate, "demandScore": item.career.demand_score,
            "skills": item.career.skills or [],
        } for item in saved_careers],
        "roadmaps": [{
            "id": item.id, "title": item.title, "progress": item.progress,
            "updatedAt": item.updated_at.isoformat(),
        } for item in roadmaps],
        "notifications": [{
            "id": item.id, "title": item.title, "message": item.message,
            "createdAt": item.created_at.isoformat(),
        } for item in notices],
        "upcomingExams": [{
            "id": item.id, "name": item.name, "examDate": item.exam_date.isoformat(),
            "registrationDeadline": item.registration_deadline.isoformat() if item.registration_deadline else None,
            "officialUrl": item.official_url,
        } for item in upcoming_exams],
        "scholarships": [{
            "id": item.id, "name": item.name, "provider": item.provider,
            "amount": float(item.amount) if item.amount is not None else None,
            "deadline": item.deadline.isoformat() if item.deadline else None,
        } for item in scholarships],
        "recentActivity": activity[:5],
    })


@student_bp.post("/me/roadmaps")
@roles_required("student")
def save_roadmap():
    user = _current_student()
    if not user:
        return error_response("Student account not found.", 404)
    data, error = json_body(("careerTitle", "milestones"))
    if error:
        return error
    career_title = data["careerTitle"]
    milestones = data["milestones"]
    if not isinstance(career_title, str) or not career_title.strip() or len(career_title.strip()) > 150:
        return error_response("careerTitle must be a non-empty string of at most 150 characters.", 400)
    if not isinstance(milestones, dict) or not milestones:
        return error_response("milestones must be a non-empty roadmap object.", 400)
    career = Career.query.filter(Career.is_active.is_(True), Career.title.ilike(career_title.strip())).first()
    if not career:
        return error_response("The selected career is not in the career catalogue, so this roadmap cannot be saved.", 422)
    roadmap = CareerRoadmap.query.filter_by(user_id=user.id, career_id=career.id).first()
    if roadmap is None:
        roadmap = CareerRoadmap(user_id=user.id, career_id=career.id, title=career.title)
        db.session.add(roadmap)
    roadmap.title = career.title
    roadmap.milestones = milestones
    try:
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return error_response("Unable to save career roadmap.", 500)
    return ok({
        "id": roadmap.id, "careerId": career.id, "title": roadmap.title,
        "milestones": roadmap.milestones, "progress": roadmap.progress,
        "completed": roadmap.is_completed,
    }, "Roadmap saved successfully.", 201)
