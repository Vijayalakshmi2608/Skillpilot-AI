"""
Authentication blueprint: register and login endpoints.
Uses bcrypt for password hashing and Flask-JWT-Extended for tokens.
All responses are JSON.
"""
from flask import Blueprint, request, jsonify
from models import db
from models.user import User
from utils.hashing import hash_password, check_password
from flask_jwt_extended import create_access_token

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new user.

    Expected JSON: {"username": "..", "email": "..", "password": ".."}
    Returns: created user (without password) and 201 status on success.
    """
    try:
        data = request.get_json(force=True)
    except Exception:
        return jsonify({"error": "Invalid JSON payload"}), 400

    username = (data or {}).get("username")
    email = (data or {}).get("email")
    password = (data or {}).get("password")

    if not username or not email or not password:
        return jsonify({"error": "username, email and password are required"}), 400

    # Ensure unique username/email
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "username already exists"}), 409
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "email already exists"}), 409

    # Hash password and create user
    pw_hash = hash_password(password)
    user = User(username=username, email=email, password_hash=pw_hash)
    db.session.add(user)
    db.session.commit()

    return jsonify({"user": user.to_dict()}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate user and return JWT access token.

    Expected JSON: {"username": ".." or "email": "..", "password": ".."}
    Returns: {"access_token": "..", "user": {..}}
    """
    try:
        data = request.get_json(force=True)
    except Exception:
        return jsonify({"error": "Invalid JSON payload"}), 400

    identifier = (data or {}).get("username") or (data or {}).get("email")
    password = (data or {}).get("password")

    if not identifier or not password:
        return jsonify({"error": "username/email and password are required"}), 400

    # Try find by username first, then email
    user = User.query.filter((User.username == identifier) | (User.email == identifier)).first()
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    if not check_password(password, user.password_hash):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity=user.id)
    return jsonify({"access_token": access_token, "user": user.to_dict()}), 200
