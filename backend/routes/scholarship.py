"""Database-backed scholarship discovery and eligibility APIs."""
from datetime import date
from decimal import Decimal, InvalidOperation
from sqlalchemy import String, asc, cast, desc, or_
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity
from models import db, Scholarship, StudentProfile, User
from utils.decorators import roles_required
from utils.responses import error_response, not_found_response

scholarship_bp = Blueprint("scholarship", __name__, url_prefix="/api/scholarships")
MAX_PER_PAGE = 100


def serialize(item):
    return {"id": item.id, "title": item.title, "provider": item.provider,
            "eligibility": item.eligibility, "amount": float(item.amount) if item.amount is not None else None,
            "lastDate": item.last_date.isoformat() if item.last_date else None,
            "website": item.website, "category": item.category, "benefits": item.benefits}


def paginate(query):
    page = request.args.get("page", 1, type=int); per_page = request.args.get("per_page", 20, type=int)
    if page is None or page < 1 or per_page is None or per_page < 1:
        return None, error_response("page and per_page must be positive integers.", 400)
    result = query.paginate(page=page, per_page=min(per_page, MAX_PER_PAGE), error_out=False)
    return {"success": True, "message": "Scholarships fetched successfully", "data": [serialize(row) for row in result.items],
            "pagination": {"page": page, "per_page": min(per_page, MAX_PER_PAGE), "total": result.total, "pages": result.pages}}, None


def apply_filters(query, require_keyword=False):
    keyword = request.args.get("keyword", request.args.get("q", "")).strip()
    if require_keyword and not keyword: return None, error_response("keyword is required.", 400)
    if keyword:
        pattern = f"%{keyword}%"; eligibility = cast(Scholarship.eligibility, String)
        query = query.filter(or_(Scholarship.title.ilike(pattern), Scholarship.provider.ilike(pattern), eligibility.ilike(pattern)))
    provider = request.args.get("provider")
    if provider: query = query.filter(Scholarship.provider.ilike(f"%{provider.strip()}%"))
    category = request.args.get("category")
    if category: query = query.filter(Scholarship.category.ilike(f"%{category.strip()}%"))
    eligibility_term = request.args.get("eligibility")
    if eligibility_term: query = query.filter(cast(Scholarship.eligibility, String).ilike(f"%{eligibility_term.strip()}%"))
    for key, expression in (("min_amount", lambda value: Scholarship.amount >= value), ("max_amount", lambda value: Scholarship.amount <= value)):
        value = request.args.get(key)
        if value is not None:
            try: query = query.filter(expression(Decimal(value)))
            except InvalidOperation: return None, error_response(f"{key} must be numeric.", 400)
    last_date = request.args.get("last_date")
    if last_date:
        try: query = query.filter(Scholarship.last_date <= date.fromisoformat(last_date))
        except ValueError: return None, error_response("last_date must use YYYY-MM-DD.", 400)
    return query, None


def sorted_query(query):
    sort_by = request.args.get("sort_by", "title").lower(); order = request.args.get("order", "asc").lower()
    columns = {"title": Scholarship.title, "amount": Scholarship.amount, "last_date": Scholarship.last_date}
    if sort_by not in columns or order not in {"asc", "desc"}:
        return None, error_response("sort_by must be title, amount, or last_date; order must be asc or desc.", 400)
    return query.order_by(desc(columns[sort_by]) if order == "desc" else asc(columns[sort_by])), None


def response_for(query):
    body, error = paginate(query)
    return error if error else (jsonify(body), 200)


@scholarship_bp.get("")
def list_scholarships():
    query, error = apply_filters(Scholarship.query.filter_by(is_active=True))
    if error: return error
    query, error = sorted_query(query)
    return error or response_for(query)


@scholarship_bp.get("/search")
def search_scholarships():
    query, error = apply_filters(Scholarship.query.filter_by(is_active=True), require_keyword=True)
    return error or response_for(query.order_by(Scholarship.title))


@scholarship_bp.get("/filter")
def filter_scholarships():
    query, error = apply_filters(Scholarship.query.filter_by(is_active=True))
    return error or response_for(query.order_by(Scholarship.title))


@scholarship_bp.get("/latest")
def latest_scholarships():
    return response_for(Scholarship.query.filter_by(is_active=True).order_by(desc(Scholarship.last_date)))


@scholarship_bp.get("/government")
def government_scholarships():
    query = Scholarship.query.filter(Scholarship.is_active.is_(True), or_(Scholarship.provider.ilike("%government%"), Scholarship.category.ilike("%government%")))
    return response_for(query.order_by(Scholarship.title))


@scholarship_bp.get("/private")
def private_scholarships():
    query = Scholarship.query.filter(Scholarship.is_active.is_(True), or_(Scholarship.provider.ilike("%private%"), Scholarship.category.ilike("%private%")))
    return response_for(query.order_by(Scholarship.title))


@scholarship_bp.get("/eligible")
@roles_required("student")
def eligible_scholarships():
    try: user = db.session.get(User, int(get_jwt_identity()))
    except (TypeError, ValueError): return error_response("Invalid authentication token.", 401)
    if not user or user.role != "student": return not_found_response("Student account not found.")
    profile = StudentProfile.query.filter_by(user_id=user.id).first()
    query = Scholarship.query.filter_by(is_active=True)
    if profile:
        terms = [profile.category, profile.state, profile.board, profile.student_class, profile.gender]
        for term in (value for value in terms if value):
            query = query.filter(cast(Scholarship.eligibility, String).ilike(f"%{term}%"))
        if profile.family_income is not None:
            # Scholarships with no amount restriction remain eligible; income requirements are stored as JSON text.
            query = query.filter(or_(cast(Scholarship.eligibility, String).notilike("%income%"), cast(Scholarship.eligibility, String).ilike(f"%{profile.family_income}%")))
    return response_for(query.order_by(desc(Scholarship.amount)))


@scholarship_bp.get("/<int:scholarship_id>")
def get_scholarship(scholarship_id):
    item = db.session.get(Scholarship, scholarship_id)
    if not item or not item.is_active: return not_found_response("Scholarship not found.")
    return jsonify({"success": True, "data": serialize(item)}), 200
