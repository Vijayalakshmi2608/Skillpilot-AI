"""JWT authorization decorators layered on top of Flask-JWT-Extended."""
from functools import wraps
from flask_jwt_extended import jwt_required, get_jwt
from utils.responses import forbidden_response


def roles_required(*roles: str):
    """Require authentication and one of the supplied role claims."""
    def decorator(view):
        @wraps(view)
        @jwt_required()
        def wrapped(*args, **kwargs):
            if get_jwt().get("role") not in roles:
                return forbidden_response()
            return view(*args, **kwargs)
        return wrapped
    return decorator


def admin_required(view):
    """Convenience decorator for administrator-only endpoints."""
    return roles_required("admin")(view)


def authentication_required(view):
    """Use Flask-JWT-Extended directly without repeating validation logic."""
    return jwt_required()(view)
