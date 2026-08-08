"""JSON response, request validation, and role-checking helpers."""
from functools import wraps
from flask import jsonify, request
from flask_jwt_extended import get_jwt


def success(data=None, message=None, status=200):
    body = {"success": True}
    if message:
        body["message"] = message
    if data is not None:
        body["data"] = data
    return jsonify(body), status


def payload(required=()):
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return None, (jsonify({"success": False, "error": "A JSON object is required."}), 400)
    missing = [field for field in required if not data.get(field)]
    if missing:
        return None, (jsonify({"success": False, "error": f"Missing required fields: {', '.join(missing)}"}), 400)
    return data, None


def admin_required(fn):
    @wraps(fn)
    def wrapped(*args, **kwargs):
        if get_jwt().get("role") != "admin":
            return jsonify({"success": False, "error": "Administrator access is required."}), 403
        return fn(*args, **kwargs)
    return wrapped
