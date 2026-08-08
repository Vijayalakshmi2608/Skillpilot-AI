"""Database-backed College discovery APIs."""
from sqlalchemy import Float, asc, cast, desc
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity
from models import db, College, User, StudentProfile
from utils.decorators import roles_required
from utils.responses import error_response, not_found_response

college_bp = Blueprint("college", __name__, url_prefix="/api/colleges")
MAX_PER_PAGE = 100


def serialize(college):
    return {"id": college.id, "name": college.name, "state": college.state,
            "district": college.district, "type": college.college_type,
            "fees": float(college.fees) if college.fees is not None else None,
            "cutoff": college.cutoff, "website": college.website,
            "rating": college.rating, "placementPercentage": college.placement_percentage,
            "courses": college.courses, "domainId": college.domain_id}


def pagination(query):
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    if page is None or page < 1 or per_page is None or per_page < 1:
        return None, error_response("page and per_page must be positive integers.", 400)
    per_page = min(per_page, MAX_PER_PAGE)
    result = query.paginate(page=page, per_page=per_page, error_out=False)
    return {"success": True, "message": "Colleges fetched successfully", "data": [serialize(item) for item in result.items],
            "pagination": {"page": page, "per_page": per_page, "total": result.total, "pages": result.pages}}, None


def apply_filters(query):
    keyword = request.args.get("keyword", request.args.get("q", "")).strip()
    if keyword:
        query = query.filter(College.name.ilike(f"%{keyword}%"))
    for parameter, column in (("state", College.state), ("district", College.district), ("college_type", College.college_type)):
        value = request.args.get(parameter)
        if value:
            query = query.filter(column.ilike(f"%{value.strip()}%"))
    numeric_filters = (("min_fees", lambda value: College.fees >= value), ("max_fees", lambda value: College.fees <= value),
                       ("min_cutoff", lambda value: cast(College.cutoff, Float) >= value), ("max_cutoff", lambda value: cast(College.cutoff, Float) <= value))
    for parameter, operation in numeric_filters:
        value = request.args.get(parameter)
        if value is not None:
            try: query = query.filter(operation(float(value)))
            except ValueError: return None, error_response(f"{parameter} must be numeric.", 400)
    return query, None


def sorted_query(query, default=College.name):
    sort = request.args.get("sort", "name").lower(); direction = request.args.get("order", "asc").lower()
    columns = {"name": College.name, "fees": College.fees, "cutoff": cast(College.cutoff, Float)}
    if sort not in columns or direction not in {"asc", "desc"}:
        return None, error_response("sort must be name, fees, or cutoff; order must be asc or desc.", 400)
    return query.order_by(desc(columns[sort]) if direction == "desc" else asc(columns[sort])), None


@college_bp.get("")
def list_colleges():
    query, error = apply_filters(College.query.filter_by(is_active=True))
    if error: return error
    query, error = sorted_query(query)
    if error: return error
    body, error = pagination(query)
    if error: return error
    return jsonify(body), 200


@college_bp.get("/search")
def search_colleges():
    if not request.args.get("keyword", request.args.get("q", "")).strip():
        return error_response("keyword is required.", 400)
    query, error = apply_filters(College.query.filter_by(is_active=True))
    if error: return error
    body, error = pagination(query.order_by(College.name))
    if error: return error
    return jsonify(body), 200


@college_bp.get("/filter")
def filter_colleges():
    query, error = apply_filters(College.query.filter_by(is_active=True))
    if error: return error
    body, error = pagination(query.order_by(College.name))
    if error: return error
    return jsonify(body), 200


@college_bp.get("/top")
def top_colleges():
    query = College.query.filter_by(is_active=True).order_by(desc(cast(College.cutoff, Float)))
    body, error = pagination(query)
    if error: return error
    return jsonify(body), 200


@college_bp.get("/states")
def states():
    rows = db.session.query(College.state).filter(College.is_active.is_(True), College.state.isnot(None)).distinct().order_by(College.state).all()
    return jsonify({"success": True, "data": [row[0] for row in rows]}), 200


@college_bp.get("/districts")
def districts():
    state = request.args.get("state", "").strip()
    if not state: return error_response("state is required.", 400)
    rows = db.session.query(College.district).filter(College.is_active.is_(True), College.state.ilike(state), College.district.isnot(None)).distinct().order_by(College.district).all()
    return jsonify({"success": True, "data": [row[0] for row in rows]}), 200


@college_bp.get("/types")
def types():
    rows = db.session.query(College.college_type).filter(College.is_active.is_(True)).distinct().order_by(College.college_type).all()
    return jsonify({"success": True, "data": [row[0] for row in rows]}), 200


@college_bp.get("/recommended")
@roles_required("student")
def recommended_colleges():
    try: user = db.session.get(User, int(get_jwt_identity()))
    except (TypeError, ValueError): return error_response("Invalid authentication token.", 401)
    if not user or user.role != "student": return error_response("Student account not found.", 404)
    profile = StudentProfile.query.filter_by(user_id=user.id).first()
    query = College.query.filter_by(is_active=True)
    if profile and profile.state: query = query.filter(College.state.ilike(profile.state))
    if profile and profile.district: query = query.filter(College.district.ilike(profile.district))
    try:
        if user.board_score is not None: query = query.filter(cast(College.cutoff, Float) <= float(user.board_score))
    except (TypeError, ValueError): pass
    if profile and profile.family_income is not None: query = query.filter((College.fees.is_(None)) | (College.fees <= profile.family_income))
    body, error = pagination(query.order_by(desc(College.rating), College.fees))
    if error: return error
    return jsonify(body), 200


@college_bp.get("/<int:college_id>")
def get_college(college_id):
    college = db.session.get(College, college_id)
    if not college or not college.is_active: return not_found_response("College not found.")
    return jsonify({"success": True, "data": serialize(college)}), 200
