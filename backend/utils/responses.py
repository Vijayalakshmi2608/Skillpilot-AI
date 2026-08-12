"""Consistent JSON-only response constructors."""
from typing import Any, Optional
from flask import jsonify


def _response(success: bool, status: int, data: Any = None, message: Optional[str] = None, errors: Any = None):
    body = {"success": success}
    if data is not None:
        body["data"] = data
    if message:
        body["message" if success else "error"] = message
    if errors is not None:
        body["errors"] = errors
    return jsonify(body), status


def success_response(data: Any = None, message: Optional[str] = None, status: int = 200):
    return _response(True, status, data, message)


def error_response(message: str = "Request failed.", status: int = 400, errors: Any = None):
    return _response(False, status, message=message, errors=errors)


def validation_error_response(errors: Any, message: str = "Validation failed."):
    return error_response(message, 422, errors)


def unauthorized_response(message: str = "Authentication is required."):
    return error_response(message, 401)


def forbidden_response(message: str = "You are not authorised to perform this action."):
    return error_response(message, 403)


def not_found_response(message: str = "Resource not found."):
    return error_response(message, 404)


def server_error_response(message: str = "An unexpected server error occurred."):
    """Intentionally use a generic message; never reveal exception details."""
    return error_response(message, 500)
