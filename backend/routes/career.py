"""Student-only, database-backed career exploration APIs."""
from sqlalchemy import or_
from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity
from models import db, User, Career, CareerDomain, CareerRoadmap
from routes import ok
from utils.decorators import roles_required
from utils.pagination import paginate_query
from utils.responses import error_response, not_found_response

career_bp = Blueprint("career", __name__, url_prefix="/api/careers")


def current_student():
    """Resolve the authenticated student User without trusting client input."""
    try:
        user = db.session.get(User, int(get_jwt_identity()))
    except (TypeError, ValueError):
        return None
    return user if user and user.role == "student" else None


def career_payload(career, detailed=True):
    data = {"id": career.id, "title": career.title, "domain": career.domain.name if career.domain else None,
            "domainId": career.domain_id, "description": career.description,
            "averageSalary": career.average_salary, "growthRate": career.growth_rate,
            "requiredSkills": career.required_skills, "eligibility": career.eligibility,
            "isActive": career.is_active}
    if detailed:
        data["educationPath"] = career.education_path
    return data


def get_career_or_404(career_id):
    career = db.session.get(Career, career_id)
    if not career or not career.is_active:
        return None, not_found_response("Career not found.")
    return career, None


@career_bp.get("")
@roles_required("student")
def list_careers():
    query = Career.query.filter_by(is_active=True).order_by(Career.title)
    return ok(paginate_query(query, career_payload, page=request.args.get("page", 1, type=int), page_size=request.args.get("per_page", request.args.get("page_size", 20), type=int)))


@career_bp.get("/search")
@roles_required("student")
def search_careers():
    keyword = request.args.get("q", "").strip()
    if not keyword:
        return error_response("Query parameter 'q' is required.", 400)
    pattern = f"%{keyword}%"
    query = Career.query.join(CareerDomain).filter(Career.is_active.is_(True)).filter(or_(Career.title.ilike(pattern), Career.description.ilike(pattern), CareerDomain.name.ilike(pattern), CareerDomain.slug.ilike(pattern))).order_by(Career.title)
    return ok(paginate_query(query, career_payload, page=request.args.get("page", 1, type=int), page_size=request.args.get("per_page", request.args.get("page_size", 20), type=int)))


@career_bp.get("/domain/<string:domain>")
@roles_required("student")
def careers_by_domain(domain):
    query = Career.query.join(CareerDomain).filter(Career.is_active.is_(True)).filter(or_(CareerDomain.slug.ilike(domain), CareerDomain.name.ilike(domain))).order_by(Career.title)
    return ok(paginate_query(query, career_payload, page=request.args.get("page", 1, type=int), page_size=request.args.get("per_page", request.args.get("page_size", 20), type=int)))


@career_bp.get("/recommendations")
@roles_required("student")
def recommendations():
    user = current_student()
    if not user:
        return not_found_response("Student account not found.")
    query = Career.query.filter_by(is_active=True)
    # Use the student's stored domain preference when it corresponds to a real domain.
    if user.domain:
        query = query.join(CareerDomain).filter(or_(CareerDomain.slug.ilike(user.domain), CareerDomain.name.ilike(user.domain)))
    return ok([career_payload(item) for item in query.order_by(Career.demand_score.desc(), Career.growth_rate.desc()).limit(10).all()])


@career_bp.get("/trending")
@roles_required("student")
def trending_careers():
    rows = Career.query.filter_by(is_active=True).order_by(Career.demand_score.desc(), Career.growth_rate.desc()).limit(10).all()
    return ok([career_payload(item) for item in rows])


@career_bp.get("/future-scope/<int:career_id>")
@roles_required("student")
def future_scope(career_id):
    career, error = get_career_or_404(career_id)
    if error: return error
    return ok({"careerId": career.id, "title": career.title, "growthRate": career.growth_rate,
               "eligibility": career.eligibility, "educationPath": career.education_path,
               "description": career.description})


@career_bp.get("/skills/<int:career_id>")
@roles_required("student")
def required_skills(career_id):
    career, error = get_career_or_404(career_id)
    if error: return error
    return ok({"careerId": career.id, "title": career.title, "requiredSkills": career.required_skills})


@career_bp.get("/salary/<int:career_id>")
@roles_required("student")
def average_salary(career_id):
    career, error = get_career_or_404(career_id)
    if error: return error
    return ok({"careerId": career.id, "title": career.title, "averageSalary": career.average_salary})


@career_bp.get("/roadmap/<int:career_id>")
@roles_required("student")
def career_roadmap(career_id):
    career, error = get_career_or_404(career_id)
    if error: return error
    user = current_student()
    if not user: return not_found_response("Student account not found.")
    roadmap = CareerRoadmap.query.filter_by(user_id=user.id, career_id=career.id).first()
    return ok({"careerId": career.id, "title": career.title,
               "roadmap": None if not roadmap else {"id": roadmap.id, "title": roadmap.title,
               "milestones": roadmap.milestones, "progress": roadmap.progress, "completed": roadmap.is_completed}})


@career_bp.get("/<int:career_id>")
@roles_required("student")
def get_career(career_id):
    career, error = get_career_or_404(career_id)
    return error if error else ok(career_payload(career))
