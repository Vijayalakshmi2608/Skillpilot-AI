"""Application error classes and registration helper with safe API output."""
from sqlalchemy.exc import SQLAlchemyError
from utils.responses import error_response, not_found_response, server_error_response, unauthorized_response, forbidden_response, validation_error_response


class APIError(Exception):
    status_code = 400
    message = "Request failed."
    def __init__(self, message=None, errors=None): self.message, self.errors = message or self.message, errors

class ValidationError(APIError):
    status_code = 422
class AuthenticationError(APIError):
    status_code = 401
class AuthorizationError(APIError):
    status_code = 403
class ResourceNotFoundError(APIError):
    status_code = 404

def register_error_handlers(app):
    """Attach production-safe JSON error handlers to a Flask app."""
    @app.errorhandler(APIError)
    def handle_api_error(error):
        if isinstance(error, ValidationError): return validation_error_response(error.errors or {}, error.message)
        if isinstance(error, AuthenticationError): return unauthorized_response(error.message)
        if isinstance(error, AuthorizationError): return forbidden_response(error.message)
        if isinstance(error, ResourceNotFoundError): return not_found_response(error.message)
        return error_response(error.message, error.status_code, error.errors)
    @app.errorhandler(SQLAlchemyError)
    def handle_database_error(error):
        app.logger.exception("Database operation failed: %s", error)
        return server_error_response()
    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        app.logger.exception("Unhandled request error: %s", error)
        return server_error_response()
