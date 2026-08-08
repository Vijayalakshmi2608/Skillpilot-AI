"""Blueprint exports and shared JSON/JWT helpers for the API layer."""
from functools import wraps
from flask import jsonify, request
from flask_jwt_extended import get_jwt, get_jwt_identity


def ok(data=None, message=None, status=200):
    body = {"success": True, "data": data}
    if message:
        body["message"] = message
    return jsonify(body), status


def json_body(required=()):
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return None, (jsonify({"success": False, "error": "Request body must be a JSON object."}), 400)
    missing = [field for field in required if data.get(field) in (None, "")]
    if missing:
        return None, (jsonify({"success": False, "error": f"Missing fields: {', '.join(missing)}"}), 400)
    return data, None


def role_required(role):
    """Require a token whose immutable role claim matches the endpoint role."""
    def decorator(fn):
        @wraps(fn)
        def wrapped(*args, **kwargs):
            if get_jwt().get("role") != role:
                return jsonify({"success": False, "error": "You are not authorised for this action."}), 403
            return fn(*args, **kwargs)
        return wrapped
    return decorator


def current_id():
    return int(get_jwt_identity())


from routes.auth import auth_bp  # noqa: E402,F401
from routes.student import student_bp  # noqa: E402,F401
from routes.admin import admin_bp  # noqa: E402,F401
from routes.career import career_bp  # noqa: E402,F401
from routes.college import college_bp  # noqa: E402,F401
from routes.scholarship import scholarship_bp  # noqa: E402,F401
from routes.assessment import assessment_bp  # noqa: E402,F401
from routes.recommendation import recommendation_bp  # noqa: E402,F401
from routes.roadmap import roadmap_bp  # noqa: E402,F401
from routes.resource import resource_bp  # noqa: E402,F401
from routes.notification import notification_bp  # noqa: E402,F401
from routes.entrance_exam import entrance_exam_bp  # noqa: E402,F401
from routes.resume_template import resume_template_bp  # noqa: E402,F401
from routes.content import content_bp  # noqa: E402,F401
from routes.public import public_bp  # noqa: E402,F401
from routes.ai import ai_bp  # noqa: E402,F401
