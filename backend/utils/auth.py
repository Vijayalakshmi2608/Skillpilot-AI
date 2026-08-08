"""Password and JWT helpers with no dependency on concrete model classes."""
from typing import Any, Optional, Type
import bcrypt
from flask_jwt_extended import create_access_token, get_jwt, get_jwt_identity


def hash_password(password: str) -> str:
    """Return a bcrypt hash; callers must never persist the original password."""
    if not isinstance(password, str) or not password:
        raise ValueError("Password must be a non-empty string.")
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """Safely compare a candidate password with a bcrypt hash."""
    if not isinstance(password, str) or not isinstance(password_hash, str):
        return False
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def create_token(user_id: int, role: str, additional_claims: Optional[dict] = None) -> str:
    """Create a JWT whose subject is the user id and whose role is a claim."""
    claims = {"role": role}
    if additional_claims:
        claims.update(additional_claims)
    return create_access_token(identity=str(user_id), additional_claims=claims)


def current_identity() -> Optional[int]:
    """Return the authenticated integer id, or None for a malformed identity."""
    try:
        return int(get_jwt_identity())
    except (TypeError, ValueError):
        return None


def current_role() -> Optional[str]:
    """Return the role in the already-verified JWT claims."""
    return get_jwt().get("role")


def get_current_user(model: Type[Any]) -> Optional[Any]:
    """Load the authenticated user from a supplied SQLAlchemy model class.

    Passing the model avoids importing application models here and prevents cycles.
    This function must be called only after ``jwt_required`` has run.
    """
    user_id = current_identity()
    return model.query.get(user_id) if user_id is not None else None
