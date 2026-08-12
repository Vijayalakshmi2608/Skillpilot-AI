"""JWT authentication endpoints backed exclusively by the User model."""
from flask import Blueprint
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt, get_jwt_identity, jwt_required
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from models import db, StudentProfile, User
from routes import ok, json_body
from utils.responses import error_response, not_found_response
from utils.validators import validate_email, validate_password, validate_string

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")
STUDENT_ROLE = "student"


def safe_user(user):
    """Serialize only non-sensitive account data."""
    profile = StudentProfile.query.filter_by(user_id=user.id).first()
    return {"id": user.id, "name": user.full_name, "fullName": user.full_name, "email": user.email,
            "role": user.role, "phone": user.phone, "stream": user.stream, "city": user.city,
            "school": user.school, "boardScore": user.board_score,
            "studentClass": profile.student_class if profile else None,
            "createdAt": user.created_at.isoformat()}


def token_response(user, status=200, message="Login successful."):
    claims = {"role": STUDENT_ROLE}
    access_token = create_access_token(identity=str(user.id), additional_claims=claims)
    refresh_token = create_refresh_token(identity=str(user.id), additional_claims=claims)
    # Retain existing camelCase keys while supporting documented snake_case keys.
    return ok({"accessToken": access_token, "access_token": access_token,
               "refreshToken": refresh_token, "refresh_token": refresh_token,
               "user": safe_user(user)}, message, status)


def validate_registration(data):
    errors = {}
    if message := validate_string(data.get("fullName"), "Full name", 2, 120): errors["fullName"] = message
    if message := validate_email(data.get("email")): errors["email"] = message
    if message := validate_password(data.get("password")): errors["password"] = message
    return errors


def register():
    data, error = json_body(("email", "password"))
    if error: return error
    if "fullName" not in data and "name" in data:
        data["fullName"] = data["name"]
    errors = validate_registration(data)
    if errors: return error_response("Validation failed.", 400, errors)
    email = data["email"].strip().lower()
    if User.query.filter_by(email=email).first(): return error_response("Email is already registered.", 409)
    user = User(full_name=data["fullName"].strip(), email=email, role=STUDENT_ROLE, phone=data.get("phone"),
                stream=data.get("stream"), city=data.get("city"), school=data.get("school"))
    user.set_password(data["password"])
    try:
        db.session.add(user); db.session.commit()
        return token_response(user, 201, "Registration successful.")
    except (IntegrityError, ValueError):
        db.session.rollback(); return error_response("Unable to create account due to conflicting data.", 409)
    except SQLAlchemyError:
        db.session.rollback(); return error_response("Unable to create account.", 500)


@auth_bp.post("/register")
@auth_bp.post("/students/register")
def student_register(): return register()


def login():
    data, error = json_body(("email", "password"))
    if error: return error
    if validate_email(data["email"]): return error_response("Invalid credentials.", 401)
    user = User.query.filter_by(email=data["email"].strip().lower()).first()
    if not user or user.role != STUDENT_ROLE or not user.check_password(data["password"]):
        return error_response("Invalid credentials.", 401)
    return token_response(user, message="Login successful.")


@auth_bp.post("/login")
@auth_bp.post("/students/login")
def student_login(): return login()


@auth_bp.get("/me")
@jwt_required()
def current_user():
    try: user = db.session.get(User, int(get_jwt_identity()))
    except (TypeError, ValueError): return error_response("Invalid authentication token.", 401)
    if not user:
        return not_found_response("Student account not found.")
    if user.role != STUDENT_ROLE or get_jwt().get("role") != STUDENT_ROLE:
        return error_response("Invalid authentication token.", 401)
    return ok(safe_user(user))


@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    try: user = db.session.get(User, int(get_jwt_identity()))
    except (TypeError, ValueError): return error_response("Invalid refresh token.", 401)
    if not user or user.role != STUDENT_ROLE or get_jwt().get("role") != STUDENT_ROLE: return error_response("Invalid refresh token.", 401)
    return ok({"accessToken": create_access_token(identity=str(user.id), additional_claims={"role": STUDENT_ROLE})})


@auth_bp.post("/forgot-password")
def forgot_password():
    data, error = json_body(("email",))
    if error: return error
    if validate_email(data["email"]): return error_response("Enter a valid email address.", 400)
    # Deliberately identical for known and unknown emails: do not reveal account existence.
    # A mail provider should call the reset-password endpoint with a verified JWT/reset link.
    return ok(message="If the account exists, password reset instructions have been sent.", status=202)


@auth_bp.post("/reset-password")
@jwt_required()
def reset_password():
    data, error = json_body(("password",))
    if error: return error
    if message := validate_password(data["password"]): return error_response("Validation failed.", 400, {"password": message})
    try: user = db.session.get(User, int(get_jwt_identity()))
    except (TypeError, ValueError): return error_response("Invalid authentication token.", 401)
    if not user or user.role != STUDENT_ROLE or get_jwt().get("role") != STUDENT_ROLE: return not_found_response("Account not found.")
    user.set_password(data["password"])
    try:
        db.session.commit(); return ok(message="Password updated.")
    except SQLAlchemyError:
        db.session.rollback(); return error_response("Unable to update password.", 500)


@auth_bp.post("/logout")
@jwt_required()
def logout():
    # JWTs are stateless; clients must discard access and refresh tokens at logout.
    return ok(message="Logged out successfully.")
