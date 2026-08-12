"""Administrator-only management APIs for the User-based application models."""
from __future__ import annotations

from collections import Counter
from datetime import date
from decimal import Decimal
from functools import wraps
import os

from flask import Blueprint, current_app, request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required
from sqlalchemy import func, or_
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from models import (
    AdminLog,
    AssessmentResult,
    Career,
    CareerDomain,
    College,
    Feedback,
    Notification,
    SavedCareer,
    Scholarship,
    StudentProfile,
    User,
    db,
)
from utils.responses import error_response, forbidden_response, not_found_response, success_response


admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


def _iso(value):
    return value.isoformat() if value is not None else None


def _value(value):
    """Make Decimal and date values JSON-safe without leaking ORM state."""
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (date,)):
        return _iso(value)
    return value


def _json_body():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return None, error_response("A JSON object is required.", 400)
    return data, None


# The response utility has a small stable interface; this keeps list responses
# consistent while allowing them to include pagination metadata.
def _list_response(items, pagination, message):
    from flask import jsonify
    return jsonify({"success": True, "message": message, "data": items, "pagination": pagination}), 200


def _paginate(query, serializer, message):
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    if page is None or page < 1 or per_page is None or per_page < 1:
        return error_response("page and per_page must be positive integers.", 400)
    per_page = min(per_page, 100)
    result = query.paginate(page=page, per_page=per_page, error_out=False)
    return _list_response([serializer(item) for item in result.items], {
        "page": result.page, "per_page": per_page, "total": result.total, "pages": result.pages,
    }, message)


def _current_admin():
    identity = get_jwt_identity()
    try:
        return db.session.get(User, int(identity))
    except (TypeError, ValueError):
        return None


def admin_required(view):
    """Require a valid JWT belonging to a currently active admin User.

    The database role is authoritative; the claim is checked as an additional
    token-consistency guard and never trusted on its own.
    """
    @wraps(view)
    @jwt_required()
    def wrapped(*args, **kwargs):
        user = _current_admin()
        if user is None:
            return error_response("Authenticated user no longer exists.", 401)
        if user.role != "admin" or get_jwt().get("role") != "admin":
            return forbidden_response("Admin access is required.")
        return view(*args, **kwargs)
    return wrapped


def _log(action, entity_type, entity_id=None, details=None):
    """Add an audit record to the current transaction; callers commit once."""
    admin = _current_admin()
    db.session.add(AdminLog(
        admin_user_id=admin.id if admin else None,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details or {},
    ))


def _user_data(user, detailed=False):
    data = {
        "id": user.id, "fullName": user.full_name, "email": user.email,
        "role": user.role, "phone": user.phone, "stream": user.stream,
        "city": user.city, "school": user.school, "boardScore": user.board_score,
        "domain": user.domain, "progress": user.progress, "createdAt": _iso(user.created_at),
        "updatedAt": _iso(user.updated_at),
    }
    if detailed and user.student_profile:
        profile = user.student_profile
        data["profile"] = {"schoolName": profile.school_name, "district": profile.district,
                           "state": profile.state, "class": profile.student_class, "board": profile.board,
                           "gender": profile.gender, "dateOfBirth": _iso(profile.date_of_birth),
                           "familyIncome": _value(profile.family_income), "category": profile.category}
    return data


def _career_data(item):
    return {"id": item.id, "domainId": item.domain_id, "domain": item.domain.name if item.domain else None,
            "title": item.title, "description": item.description, "eligibility": item.eligibility,
            "requiredSkills": item.skills or [], "averageSalary": item.salary_range,
            "demandScore": item.demand_score, "growthRate": item.growth_rate,
            "educationPath": item.education_path or [], "isActive": item.is_active,
            "createdAt": _iso(item.created_at), "updatedAt": _iso(item.updated_at)}


def _college_data(item):
    return {"id": item.id, "domainId": item.domain_id, "name": item.name, "state": item.state,
            "district": item.district, "type": item.college_type, "fees": _value(item.fees),
            "cutoff": item.cutoff, "placementPercentage": item.placement_percentage, "rating": item.rating,
            "courses": item.courses or [], "website": item.website, "isActive": item.is_active,
            "createdAt": _iso(item.created_at), "updatedAt": _iso(item.updated_at)}


def _scholarship_data(item):
    return {"id": item.id, "title": item.name, "provider": item.provider, "amount": _value(item.amount),
            "deadline": _iso(item.deadline), "category": item.category, "eligibility": item.eligibility or [],
            "benefits": item.benefits or [], "website": item.application_url, "isActive": item.is_active,
            "createdAt": _iso(item.created_at), "updatedAt": _iso(item.updated_at)}


def _feedback_data(item):
    return {"id": item.id, "userId": item.user_id, "user": _user_data(item.user) if item.user else None,
            "subject": item.subject, "message": item.message, "rating": item.rating, "status": item.status,
            "createdAt": _iso(item.created_at)}


def _notification_data(item):
    return {"id": item.id, "studentId": item.student_id, "title": item.title, "message": item.message,
            "type": item.notification_type, "isRead": item.is_read, "createdAt": _iso(item.created_at)}


def _db_error(message="Unable to complete the database operation."):
    db.session.rollback()
    return error_response(message, 500)


def _required(data, *names):
    missing = [name for name in names if not isinstance(data.get(name), str) or not data[name].strip()]
    return error_response("Missing or invalid required fields.", 400, {name: "Required." for name in missing}) if missing else None


def _set_fields(instance, data, mappings, boolean_fields=(), json_fields=()):
    """Apply explicitly allow-listed fields only; no password/role fields are accepted."""
    errors = {}
    for source, target in mappings.items():
        if source not in data:
            continue
        value = data[source]
        if source in boolean_fields and not isinstance(value, bool):
            errors[source] = "Must be a boolean."
        elif source in json_fields and not isinstance(value, list):
            errors[source] = "Must be an array."
        elif isinstance(value, str):
            setattr(instance, target, value.strip())
        else:
            setattr(instance, target, value)
    return errors


@admin_bp.get("/dashboard")
@admin_required
def dashboard():
    recent_assessments = AssessmentResult.query.order_by(AssessmentResult.created_at.desc()).limit(5).all()
    return success_response({
        "totalUsers": User.query.count(), "totalStudents": User.query.filter_by(role="student").count(),
        "totalParents": User.query.filter_by(role="parent").count(), "totalCareers": Career.query.count(),
        "totalColleges": College.query.count(), "totalScholarships": Scholarship.query.count(),
        "totalAssessments": AssessmentResult.query.count(), "totalFeedback": Feedback.query.count(),
        "recentRegistrations": [_user_data(u) for u in User.query.order_by(User.created_at.desc()).limit(5)],
        "recentAssessments": [{"id": r.id, "userId": r.user_id, "createdAt": _iso(r.created_at)} for r in recent_assessments],
        "recentFeedback": [_feedback_data(f) for f in Feedback.query.order_by(Feedback.created_at.desc()).limit(5)],
    }, "Dashboard fetched successfully.")


@admin_bp.get("/careers")
@admin_required
def list_careers():
    query = Career.query
    if q := request.args.get("q", "").strip():
        query = query.filter(or_(Career.title.ilike(f"%{q}%"), Career.description.ilike(f"%{q}%")))
    if domain_id := request.args.get("domain_id", type=int):
        query = query.filter_by(domain_id=domain_id)
    return _paginate(query.order_by(Career.title.asc()), _career_data, "Careers fetched successfully.")


@admin_bp.post("/careers")
@admin_required
def create_career():
    data, error = _json_body()
    if error: return error
    if error := _required(data, "title", "description"): return error
    domain_id = data.get("domainId")
    if not isinstance(domain_id, int) or not db.session.get(CareerDomain, domain_id):
        return error_response("A valid domainId is required.", 400)
    if Career.query.filter(func.lower(Career.title) == data["title"].strip().lower()).first():
        return error_response("A career with this title already exists.", 409)
    career = Career(domain_id=domain_id, title=data["title"].strip(), description=data["description"].strip())
    errors = _set_fields(career, data, {"eligibility": "eligibility", "salaryRange": "salary_range", "demandScore": "demand_score", "growthRate": "growth_rate", "requiredSkills": "skills", "educationPath": "education_path", "isActive": "is_active"}, ("isActive",), ("requiredSkills", "educationPath"))
    if errors: return error_response("Validation failed.", 400, errors)
    try:
        db.session.add(career); db.session.flush(); _log("create", "career", career.id, {"title": career.title}); db.session.commit()
        return success_response(_career_data(career), "Career created successfully.", 201)
    except (IntegrityError, ValueError):
        db.session.rollback(); return error_response("Career data conflicts with an existing record.", 409)
    except SQLAlchemyError: return _db_error()


@admin_bp.put("/careers/<int:career_id>")
@admin_required
def update_career(career_id):
    career = db.session.get(Career, career_id)
    if not career: return not_found_response("Career not found.")
    data, error = _json_body()
    if error: return error
    if "domainId" in data and (not isinstance(data["domainId"], int) or not db.session.get(CareerDomain, data["domainId"])):
        return error_response("domainId must reference an existing career domain.", 400)
    if "title" in data and (not isinstance(data["title"], str) or not data["title"].strip()): return error_response("title must be a non-empty string.", 400)
    if "title" in data and Career.query.filter(func.lower(Career.title) == data["title"].strip().lower(), Career.id != career.id).first(): return error_response("A career with this title already exists.", 409)
    errors = _set_fields(career, data, {"domainId": "domain_id", "title": "title", "description": "description", "eligibility": "eligibility", "salaryRange": "salary_range", "demandScore": "demand_score", "growthRate": "growth_rate", "requiredSkills": "skills", "educationPath": "education_path", "isActive": "is_active"}, ("isActive",), ("requiredSkills", "educationPath"))
    if errors: return error_response("Validation failed.", 400, errors)
    try:
        _log("update", "career", career.id); db.session.commit(); return success_response(_career_data(career), "Career updated successfully.")
    except (IntegrityError, ValueError): db.session.rollback(); return error_response("Career update is invalid.", 400)
    except SQLAlchemyError: return _db_error()


@admin_bp.delete("/careers/<int:career_id>")
@admin_required
def delete_career(career_id):
    career = db.session.get(Career, career_id)
    if not career: return not_found_response("Career not found.")
    try:
        db.session.delete(career); _log("delete", "career", career_id, {"title": career.title}); db.session.commit()
        return success_response(message="Career deleted successfully.")
    except IntegrityError:
        db.session.rollback(); return error_response("Career cannot be deleted while related records exist.", 409)
    except SQLAlchemyError: return _db_error()


@admin_bp.get("/colleges")
@admin_required
def list_colleges():
    query = College.query
    if q := request.args.get("q", "").strip(): query = query.filter(College.name.ilike(f"%{q}%"))
    for field, column in (("state", College.state), ("district", College.district), ("type", College.college_type)):
        if value := request.args.get(field, "").strip(): query = query.filter(column.ilike(value))
    return _paginate(query.order_by(College.name.asc()), _college_data, "Colleges fetched successfully.")


def _write_college(college, data, creating=False):
    if creating:
        error = _required(data, "name", "state", "type")
        if error: return error
    if "name" in data and (not isinstance(data["name"], str) or not data["name"].strip()): return error_response("name must be a non-empty string.", 400)
    if "name" in data and College.query.filter(func.lower(College.name) == data["name"].strip().lower(), College.id != (college.id or 0)).first(): return error_response("A college with this name already exists.", 409)
    if "domainId" in data and data["domainId"] is not None and (not isinstance(data["domainId"], int) or not db.session.get(CareerDomain, data["domainId"])): return error_response("domainId must reference an existing career domain.", 400)
    errors = _set_fields(college, data, {"domainId": "domain_id", "name": "name", "state": "state", "district": "district", "type": "college_type", "fees": "fees", "cutoff": "cutoff", "placementPercentage": "placement_percentage", "rating": "rating", "courses": "courses", "website": "website", "isActive": "is_active"}, ("isActive",), ("courses",))
    return error_response("Validation failed.", 400, errors) if errors else None


@admin_bp.post("/colleges")
@admin_required
def create_college():
    data, error = _json_body()
    if error: return error
    college = College()
    if error := _write_college(college, data, True): return error
    try:
        db.session.add(college); db.session.flush(); _log("create", "college", college.id, {"name": college.name}); db.session.commit(); return success_response(_college_data(college), "College created successfully.", 201)
    except (IntegrityError, ValueError): db.session.rollback(); return error_response("College data is invalid or conflicts with an existing record.", 409)
    except SQLAlchemyError: return _db_error()


@admin_bp.put("/colleges/<int:college_id>")
@admin_required
def update_college(college_id):
    college = db.session.get(College, college_id)
    if not college: return not_found_response("College not found.")
    data, error = _json_body()
    if error: return error
    if error := _write_college(college, data): return error
    try:
        _log("update", "college", college.id); db.session.commit(); return success_response(_college_data(college), "College updated successfully.")
    except (IntegrityError, ValueError): db.session.rollback(); return error_response("College update is invalid.", 400)
    except SQLAlchemyError: return _db_error()


@admin_bp.delete("/colleges/<int:college_id>")
@admin_required
def delete_college(college_id):
    college = db.session.get(College, college_id)
    if not college: return not_found_response("College not found.")
    try:
        db.session.delete(college); _log("delete", "college", college_id, {"name": college.name}); db.session.commit(); return success_response(message="College deleted successfully.")
    except IntegrityError: db.session.rollback(); return error_response("College cannot be deleted while related records exist.", 409)
    except SQLAlchemyError: return _db_error()


@admin_bp.get("/scholarships")
@admin_required
def list_scholarships():
    query = Scholarship.query
    if q := request.args.get("q", "").strip(): query = query.filter(or_(Scholarship.name.ilike(f"%{q}%"), Scholarship.provider.ilike(f"%{q}%")))
    if category := request.args.get("category", "").strip(): query = query.filter(Scholarship.category.ilike(category))
    return _paginate(query.order_by(Scholarship.created_at.desc()), _scholarship_data, "Scholarships fetched successfully.")


def _write_scholarship(item, data, creating=False):
    if creating:
        error = _required(data, "title", "provider", "category")
        if error: return error
    if "title" in data and (not isinstance(data["title"], str) or not data["title"].strip()): return error_response("title must be a non-empty string.", 400)
    if "title" in data and Scholarship.query.filter(func.lower(Scholarship.name) == data["title"].strip().lower(), Scholarship.id != (item.id or 0)).first(): return error_response("A scholarship with this title already exists.", 409)
    if "deadline" in data and data["deadline"] is not None:
        try: data = {**data, "deadline": date.fromisoformat(data["deadline"])}
        except (TypeError, ValueError): return error_response("deadline must use YYYY-MM-DD.", 400)
    errors = _set_fields(item, data, {"title": "name", "provider": "provider", "amount": "amount", "deadline": "deadline", "category": "category", "eligibility": "eligibility", "benefits": "benefits", "website": "application_url", "isActive": "is_active"}, ("isActive",), ("eligibility", "benefits"))
    return error_response("Validation failed.", 400, errors) if errors else None


@admin_bp.post("/scholarships")
@admin_required
def create_scholarship():
    data, error = _json_body()
    if error: return error
    item = Scholarship()
    if error := _write_scholarship(item, data, True): return error
    try:
        db.session.add(item); db.session.flush(); _log("create", "scholarship", item.id, {"title": item.name}); db.session.commit(); return success_response(_scholarship_data(item), "Scholarship created successfully.", 201)
    except (IntegrityError, ValueError): db.session.rollback(); return error_response("Scholarship data is invalid or conflicts with an existing record.", 409)
    except SQLAlchemyError: return _db_error()


@admin_bp.put("/scholarships/<int:scholarship_id>")
@admin_required
def update_scholarship(scholarship_id):
    item = db.session.get(Scholarship, scholarship_id)
    if not item: return not_found_response("Scholarship not found.")
    data, error = _json_body()
    if error: return error
    if error := _write_scholarship(item, data): return error
    try:
        _log("update", "scholarship", item.id); db.session.commit(); return success_response(_scholarship_data(item), "Scholarship updated successfully.")
    except (IntegrityError, ValueError): db.session.rollback(); return error_response("Scholarship update is invalid.", 400)
    except SQLAlchemyError: return _db_error()


@admin_bp.delete("/scholarships/<int:scholarship_id>")
@admin_required
def delete_scholarship(scholarship_id):
    item = db.session.get(Scholarship, scholarship_id)
    if not item: return not_found_response("Scholarship not found.")
    try:
        db.session.delete(item); _log("delete", "scholarship", scholarship_id, {"title": item.name}); db.session.commit(); return success_response(message="Scholarship deleted successfully.")
    except IntegrityError: db.session.rollback(); return error_response("Scholarship cannot be deleted while related records exist.", 409)
    except SQLAlchemyError: return _db_error()


def _people(role, label):
    query = User.query.filter_by(role=role)
    if q := request.args.get("q", "").strip(): query = query.filter(or_(User.full_name.ilike(f"%{q}%"), User.email.ilike(f"%{q}%")))
    return _paginate(query.order_by(User.created_at.desc()), lambda user: _user_data(user, True), f"{label} fetched successfully.")


@admin_bp.get("/students")
@admin_required
def list_students(): return _people("student", "Students")


@admin_bp.get("/parents")
@admin_required
def list_parents(): return _people("parent", "Parents")


def _person(role, user_id, label):
    user = db.session.get(User, user_id)
    if user is None or user.role != role: return None, not_found_response(f"{label[:-1]} not found.")
    return user, None


@admin_bp.get("/students/<int:user_id>")
@admin_required
def get_student(user_id):
    user, error = _person("student", user_id, "Students")
    return error or success_response(_user_data(user, True), "Student fetched successfully.")


@admin_bp.get("/parents/<int:user_id>")
@admin_required
def get_parent(user_id):
    user, error = _person("parent", user_id, "Parents")
    return error or success_response(_user_data(user, True), "Parent fetched successfully.")


def _update_person(role, user_id, label):
    user, error = _person(role, user_id, label)
    if error: return error
    data, error = _json_body()
    if error: return error
    if "email" in data:
        email = data["email"].strip().lower() if isinstance(data["email"], str) else ""
        if "@" not in email: return error_response("email must be valid.", 400)
        if User.query.filter(User.email == email, User.id != user.id).first(): return error_response("Email already exists.", 409)
        user.email = email
    errors = _set_fields(user, data, {"fullName": "full_name", "phone": "phone", "stream": "stream", "city": "city", "school": "school", "boardScore": "board_score", "domain": "domain", "progress": "progress"})
    if errors: return error_response("Validation failed.", 400, errors)
    try:
        _log("update", role, user.id); db.session.commit(); return success_response(_user_data(user, True), f"{label[:-1]} updated successfully.")
    except IntegrityError: db.session.rollback(); return error_response("User data conflicts with an existing record.", 409)
    except SQLAlchemyError: return _db_error()


@admin_bp.put("/students/<int:user_id>")
@admin_required
def update_student(user_id): return _update_person("student", user_id, "Students")


@admin_bp.put("/parents/<int:user_id>")
@admin_required
def update_parent(user_id): return _update_person("parent", user_id, "Parents")


def _delete_person(role, user_id, label):
    user, error = _person(role, user_id, label)
    if error: return error
    try:
        db.session.delete(user); _log("delete", role, user_id, {"email": user.email}); db.session.commit(); return success_response(message=f"{label[:-1]} deleted successfully.")
    except IntegrityError: db.session.rollback(); return error_response(f"{label[:-1]} cannot be deleted while related records exist.", 409)
    except SQLAlchemyError: return _db_error()


@admin_bp.delete("/students/<int:user_id>")
@admin_required
def delete_student(user_id): return _delete_person("student", user_id, "Students")


@admin_bp.delete("/parents/<int:user_id>")
@admin_required
def delete_parent(user_id): return _delete_person("parent", user_id, "Parents")


@admin_bp.get("/feedback")
@admin_required
def list_feedback():
    query = Feedback.query
    if status := request.args.get("status", "").strip(): query = query.filter(Feedback.status == status)
    return _paginate(query.order_by(Feedback.created_at.desc()), _feedback_data, "Feedback fetched successfully.")


@admin_bp.delete("/feedback/<int:feedback_id>")
@admin_required
def delete_feedback(feedback_id):
    item = db.session.get(Feedback, feedback_id)
    if not item: return not_found_response("Feedback not found.")
    try:
        db.session.delete(item); _log("delete", "feedback", feedback_id); db.session.commit(); return success_response(message="Feedback deleted successfully.")
    except SQLAlchemyError: return _db_error()


@admin_bp.get("/notifications")
@admin_required
def list_notifications():
    return _paginate(Notification.query.order_by(Notification.created_at.desc()), _notification_data, "Notifications fetched successfully.")


@admin_bp.post("/notifications")
@admin_required
def create_notification():
    data, error = _json_body()
    if error: return error
    if error := _required(data, "title", "message"): return error
    kind = data.get("type", "system")
    if not isinstance(kind, str) or not kind.strip(): return error_response("type must be a non-empty string.", 400)
    # Notification is a legacy Student/Admin model. Admin-created notices are
    # therefore global (student_id/admin_id remain NULL) rather than accepting
    # an incompatible User id supplied by a client.
    item = Notification(title=data["title"].strip(), message=data["message"].strip(), notification_type=kind.strip(), legacy_type=kind.strip(), is_read=False, legacy_read=False)
    try:
        db.session.add(item); db.session.flush(); _log("create", "notification", item.id, {"title": item.title}); db.session.commit(); return success_response(_notification_data(item), "Notification created successfully.", 201)
    except (IntegrityError, ValueError): db.session.rollback(); return error_response("Notification data is invalid.", 400)
    except SQLAlchemyError: return _db_error()


@admin_bp.delete("/notifications/<int:notification_id>")
@admin_required
def delete_notification(notification_id):
    item = db.session.get(Notification, notification_id)
    if not item: return not_found_response("Notification not found.")
    try:
        db.session.delete(item); _log("delete", "notification", notification_id); db.session.commit(); return success_response(message="Notification deleted successfully.")
    except SQLAlchemyError: return _db_error()


@admin_bp.get("/analytics")
@admin_required
def analytics():
    registrations = Counter(_iso(user.created_at)[:7] for user in User.query.all() if user.created_at)
    saved = db.session.query(Career.title, func.count(SavedCareer.id).label("count")).join(SavedCareer, SavedCareer.career_id == Career.id).group_by(Career.id).order_by(func.count(SavedCareer.id).desc()).limit(10).all()
    domains = db.session.query(CareerDomain.name, func.count(Career.id)).outerjoin(Career, Career.domain_id == CareerDomain.id).group_by(CareerDomain.id).all()
    students = User.query.filter_by(role="student").count()
    assessments = AssessmentResult.query.count()
    return success_response({
        "userRegistrationsByMonth": [{"month": month, "count": count} for month, count in sorted(registrations.items())],
        "assessmentCompletionRate": round((assessments / students * 100), 2) if students else 0,
        "mostSearchedCareers": [],  # No search-event model exists; do not invent analytics data.
        "mostSavedCareers": [{"career": title, "count": count} for title, count in saved],
        "scholarshipPopularity": [],  # No application/saved-scholarship model exists.
        "collegePopularity": [],       # No college interaction model exists.
        "careerDomainDistribution": [{"domain": name, "count": count} for name, count in domains],
    }, "Analytics fetched successfully.")


@admin_bp.get("/system")
@admin_required
def system():
    uri = current_app.config.get("SQLALCHEMY_DATABASE_URI", "")
    path = uri.removeprefix("sqlite:///") if uri.startswith("sqlite:///") else None
    storage = os.path.getsize(path) if path and os.path.isfile(path) else None
    return success_response({
        "apiStatus": "healthy", "database": "sqlite",
        "storageBytes": storage,
        "recordCounts": {"users": User.query.count(), "studentProfiles": StudentProfile.query.count(),
                         "careers": Career.query.count(), "colleges": College.query.count(),
                         "scholarships": Scholarship.query.count(), "assessmentResults": AssessmentResult.query.count(),
                         "feedback": Feedback.query.count(), "notifications": Notification.query.count(),
                         "adminLogs": AdminLog.query.count()},
    }, "System statistics fetched successfully.")
