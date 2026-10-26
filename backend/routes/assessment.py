"""Student assessment question, submission, scoring, and recommendation APIs."""
import random
from collections import defaultdict
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError
from models import (db, User, AssessmentQuestion, AssessmentOption, AssessmentResult,
                    Career, CareerDomain, CareerRoadmap)
from utils.decorators import roles_required
from utils.responses import error_response, not_found_response

assessment_bp = Blueprint("assessment", __name__, url_prefix="/api/assessment")
MAX_PER_PAGE = 100


def question_payload(question):
    return {"id": question.id, "question": question.question, "category": question.category,
            "options": [{"id": option.id, "text": option.option_text, "value": option.value}
                        for option in question.options]}


def current_student():
    try: user = db.session.get(User, int(get_jwt_identity()))
    except (TypeError, ValueError): return None
    return user if user and user.role == "student" else None


def paginate_questions(query):
    page = request.args.get("page", 1, type=int); per_page = request.args.get("per_page", 20, type=int)
    if page is None or page < 1 or per_page is None or per_page < 1:
        return None, error_response("page and per_page must be positive integers.", 400)
    result = query.paginate(page=page, per_page=min(per_page, MAX_PER_PAGE), error_out=False)
    return {"success": True, "data": [question_payload(item) for item in result.items],
            "pagination": {"page": page, "per_page": min(per_page, MAX_PER_PAGE), "total": result.total, "pages": result.pages}}, None


def normalize_answers(raw_answers):
    """Accept [{questionId, optionId}] or {questionId: optionId} without trusting scores."""
    if isinstance(raw_answers, dict):
        raw_answers = [{"questionId": key, "optionId": value} for key, value in raw_answers.items()]
    if not isinstance(raw_answers, list) or not raw_answers:
        return None, "answers must be a non-empty object or array."
    normalized = []
    for answer in raw_answers:
        if not isinstance(answer, dict): return None, "Each answer must be an object."
        question_id, option_id = answer.get("questionId"), answer.get("optionId")
        try: question_id, option_id = int(question_id), int(option_id)
        except (TypeError, ValueError): return None, "questionId and optionId must be integers."
        normalized.append((question_id, option_id))
    if len({question_id for question_id, _ in normalized}) != len(normalized):
        return None, "Each question may be answered only once."
    return normalized, None


def score_answers(answers):
    scores = defaultdict(float)
    stored = []
    domain_aliases = {
        "technology": "it",
        "health": "medical",
        "business": "entrepreneurship",
        "humanities": "journalism",
        "research": "data-science",
        "field": "agriculture",
        "data": "data-science",
        "communication": "education",
        "public_service": "civil-services",
        "leadership": "entrepreneurship",
        "technical": "engineering",
        "security": "cyber-security",
        "sustainability": "renewable-energy",
    }
    for question_id, option_id in answers:
        question = db.session.get(AssessmentQuestion, question_id)
        option = db.session.get(AssessmentOption, option_id)
        if not question or not option or option.question_id != question.id:
            return None, None, "One or more answers reference an invalid question or option."
        try:
            weight = float(option.value) if option.value is not None else 1.0
            score_key = question.category
        except ValueError:
            weight = 1.0
            score_key = option.value.strip().lower() if isinstance(option.value, str) and option.value.strip() else question.category
            if score_key and not CareerDomain.query.filter_by(slug=score_key).first():
                score_key = domain_aliases.get(score_key, score_key)
        if score_key:
            scores[score_key.lower()] += weight
        stored.append({"questionId": question.id, "optionId": option.id})
    return stored, dict(scores), None


def recommended_careers(scores):
    if not scores: return []
    domains = CareerDomain.query.filter(CareerDomain.slug.in_(scores.keys())).all()
    domain_ids = [domain.id for domain in domains]
    if not domain_ids: return []
    return [{"id": career.id, "title": career.title, "domain": career.domain.name,
             "matchScore": scores.get(career.domain.slug, 0)}
            for career in Career.query.filter(Career.is_active.is_(True), Career.domain_id.in_(domain_ids)).order_by(Career.demand_score.desc()).limit(10).all()]


@assessment_bp.get("/questions")
def list_questions():
    query = AssessmentQuestion.query.filter_by(is_active=True).order_by(AssessmentQuestion.display_order)
    if request.args.get("random", "false").lower() == "true":
        rows = query.all(); random.shuffle(rows)
        return jsonify({"success": True, "data": [question_payload(row) for row in rows]}), 200
    body, error = paginate_questions(query)
    return error if error else (jsonify(body), 200)


@assessment_bp.get("/questions/<int:question_id>")
def get_question(question_id):
    question = db.session.get(AssessmentQuestion, question_id)
    if not question or not question.is_active: return not_found_response("Assessment question not found.")
    return jsonify({"success": True, "data": question_payload(question)}), 200


@assessment_bp.post("/submit")
@roles_required("student")
def submit_assessment():
    user = current_student()
    if not user: return not_found_response("Student account not found.")
    data = request.get_json(silent=True)
    if not isinstance(data, dict): return error_response("Request body must be a JSON object.", 400)
    answers, error = normalize_answers(data.get("answers"))
    if error: return error_response(error, 400)
    stored_answers, scores, error = score_answers(answers)
    if error: return error_response(error, 400)
    recommendations = recommended_careers(scores)
    result = {"scores": scores, "recommendations": recommendations}
    try:
        submission = AssessmentResult(user_id=user.id, answers=stored_answers, result=result)
        db.session.add(submission); db.session.commit()
        return jsonify({"success": True, "message": "Assessment submitted successfully", "data": {"id": submission.id, "answers": stored_answers, "result": result}}), 201
    except SQLAlchemyError:
        db.session.rollback(); return error_response("Unable to save assessment result.", 500)


@assessment_bp.get("/results")
@roles_required("student")
def my_results():
    user = current_student()
    if not user: return not_found_response("Student account not found.")
    rows = AssessmentResult.query.filter_by(user_id=user.id).order_by(AssessmentResult.created_at.desc()).all()
    return jsonify({"success": True, "data": [{"id": row.id, "answers": row.answers, "result": row.result, "createdAt": row.created_at.isoformat()} for row in rows]}), 200


@assessment_bp.get("/roadmaps/<int:career_id>")
@roles_required("student")
def roadmap(career_id):
    user = current_student()
    if not user: return not_found_response("Student account not found.")
    item = CareerRoadmap.query.filter_by(user_id=user.id, career_id=career_id).first()
    if not item: return not_found_response("Career roadmap not found.")
    return jsonify({"success": True, "data": {"id": item.id, "careerId": item.career_id, "title": item.title, "milestones": item.milestones, "progress": item.progress, "completed": item.is_completed}}), 200
