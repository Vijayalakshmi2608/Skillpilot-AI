"""
User-related routes. Protected endpoints that require a valid JWT access token.
"""
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models import db

users_bp = Blueprint("users", __name__)


@users_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    """Return the profile of the currently authenticated user."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user.to_dict()}), 200


@users_bp.route("/", methods=["GET"])
def list_public_users():
    """Public endpoint to list users (limited fields). Useful for admin/client lists.
    This endpoint intentionally does not expose password hashes or sensitive data.
    """
    users = User.query.all()
    return jsonify({"users": [u.to_dict() for u in users]}), 200
