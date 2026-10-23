"""Small, predictable validation helpers for JSON request payloads."""
import re
from typing import Any, Iterable, Mapping, Optional, Tuple

EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def required_fields(data: Mapping[str, Any], fields: Iterable[str]) -> dict:
    """Return field-specific errors for absent, null, or blank required values."""
    return {field: "This field is required." for field in fields if data.get(field) is None or (isinstance(data.get(field), str) and not data[field].strip())}


def validate_email(value: Any) -> Optional[str]:
    if not isinstance(value, str) or not EMAIL_PATTERN.fullmatch(value.strip()):
        return "Enter a valid email address."
    return None


def validate_password(value: Any, minimum_length: int = 8) -> Optional[str]:
    if not isinstance(value, str) or len(value) < minimum_length:
        return f"Password must be at least {minimum_length} characters."
    if len(value.encode("utf-8")) > 72:
        return "Password must not exceed 72 UTF-8 bytes."
    return None


def validate_integer(value: Any, field_name: str = "Value", minimum: Optional[int] = None) -> Optional[str]:
    if isinstance(value, bool) or not isinstance(value, int):
        return f"{field_name} must be an integer."
    if minimum is not None and value < minimum:
        return f"{field_name} must be at least {minimum}."
    return None


def validate_string(value: Any, field_name: str = "Value", minimum_length: int = 1, maximum_length: Optional[int] = None) -> Optional[str]:
    if not isinstance(value, str) or len(value.strip()) < minimum_length:
        return f"{field_name} must contain at least {minimum_length} character(s)."
    if maximum_length is not None and len(value.strip()) > maximum_length:
        return f"{field_name} must not exceed {maximum_length} characters."
    return None


def validate_request_data(data: Any, required: Iterable[str] = ()) -> Tuple[Optional[dict], dict]:
    """Validate a decoded JSON object and return ``(clean_data, errors)``."""
    if not isinstance(data, dict):
        return None, {"body": "Request body must be a JSON object."}
    errors = required_fields(data, required)
    return dict(data), errors


def common_field_validation(data: Mapping[str, Any], email_field: str = "email", password_field: str = "password") -> dict:
    """Apply email/password checks only when their fields are present."""
    errors = {}
    if email_field in data and (error := validate_email(data[email_field])):
        errors[email_field] = error
    if password_field in data and (error := validate_password(data[password_field])):
        errors[password_field] = error
    return errors
