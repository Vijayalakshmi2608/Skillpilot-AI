"""SkillPilot Flask API application factory and development entry point."""
import logging
import os
from time import perf_counter

from flask import Flask, g, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from sqlalchemy import event, text
from sqlalchemy.engine import Engine
from werkzeug.exceptions import HTTPException
from config import Config
from models import db, Admin, RevokedToken
from utils.auth import hash_password
from routes import (auth_bp, content_bp, student_bp, admin_bp, public_bp, career_bp,
                    college_bp, scholarship_bp, assessment_bp, recommendation_bp,
                    roadmap_bp, resource_bp, notification_bp, entrance_exam_bp,
                    resume_template_bp, ai_bp)


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    config_class.validate_security()

    # Local development values come from backend/.env; production rejects
    # placeholder values in Config.validate_security before this point.
    if not app.config.get("SECRET_KEY") or not app.config.get("JWT_SECRET_KEY"):
        raise RuntimeError(
            "SECRET_KEY and JWT_SECRET_KEY must be configured as environment "
            "variables or in backend/.env."
        )

    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}}, supports_credentials=False)
    db.init_app(app)
    jwt = JWTManager(app)

    @jwt.token_in_blocklist_loader
    def is_revoked(_header, payload):
        return db.session.get(RevokedToken, payload["jti"]) is not None

    @app.before_request
    def start_request_timer():
        """Record request execution time without logging sensitive headers/body."""
        g.request_started_at = perf_counter()
        app.logger.info("Request started: %s %s", request.method, request.path)

    @app.after_request
    def add_security_headers_and_log(response):
        """Apply baseline browser protections and log response timing."""
        elapsed_ms = (perf_counter() - getattr(g, "request_started_at", perf_counter())) * 1000
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Cache-Control"] = "no-store" if request.path.startswith("/api/auth") else response.headers.get("Cache-Control", "no-store")
        app.logger.info("Request completed: %s %s -> %s (%.2f ms)", request.method, request.path, response.status_code, elapsed_ms)
        return response

    def json_error(message, status):
        return jsonify({"success": False, "message": message}), status

    @jwt.unauthorized_loader
    def missing_token(_reason):
        return json_error("Authentication is required.", 401)

    @jwt.invalid_token_loader
    def invalid_token(_reason):
        return json_error("Invalid authentication token.", 401)

    @jwt.expired_token_loader
    def expired_token(_header, _payload):
        return json_error("Authentication token has expired.", 401)

    app.register_blueprint(public_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(content_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(career_bp)
    app.register_blueprint(college_bp)
    app.register_blueprint(scholarship_bp)
    app.register_blueprint(assessment_bp)
    app.register_blueprint(recommendation_bp)
    app.register_blueprint(roadmap_bp)
    app.register_blueprint(resource_bp)
    app.register_blueprint(notification_bp)
    app.register_blueprint(entrance_exam_bp)
    app.register_blueprint(resume_template_bp)
    app.register_blueprint(ai_bp)

    @app.get("/")
    def home():
        """JSON API landing endpoint for direct server-root requests."""
        return jsonify({
            "success": True,
            "message": "Backend is running",
        }), 200

    @app.errorhandler(404)
    def not_found(_error):
        return json_error("Resource not found.", 404)

    @app.errorhandler(400)
    def bad_request(_error):
        return json_error("Bad request.", 400)

    @app.errorhandler(401)
    def unauthorized(_error):
        return json_error("Authentication is required.", 401)

    @app.errorhandler(403)
    def forbidden(_error):
        return json_error("You do not have permission to perform this action.", 403)

    @app.errorhandler(405)
    def method_not_allowed(_error):
        return json_error("Method not allowed.", 405)

    @app.errorhandler(409)
    def conflict(_error):
        return json_error("The request conflicts with an existing resource.", 409)

    @app.errorhandler(422)
    def validation_error(_error):
        return json_error("Validation failed.", 422)

    @app.errorhandler(429)
    def rate_limited(_error):
        return json_error("Too many requests. Please try again later.", 429)

    @app.errorhandler(413)
    def too_large(_error):
        return json_error("Request body is too large.", 413)

    @app.errorhandler(Exception)
    def unhandled_error(error):
        if isinstance(error, HTTPException):
            return json_error(error.description, error.code or 500)
        app.logger.exception("Unhandled API error: %s", error)
        return json_error("An unexpected server error occurred.", 500)

    with app.app_context():
        db.create_all()
        db.session.execute(text("SELECT 1"))
        _create_default_admin()
        db.session.remove()
        registered = ", ".join(sorted(app.blueprints))
        app.logger.setLevel(logging.INFO)
        print(f"Startup checks passed: SQLite connected; blueprints registered: {registered}")
    return app


def _create_default_admin():
    """Optionally provision an initial admin from environment variables."""
    email = os.getenv("ADMIN_EMAIL")
    password = os.getenv("ADMIN_PASSWORD")
    if email and password and not Admin.query.filter_by(email=email.lower()).first():
        admin = Admin(full_name=os.getenv("ADMIN_NAME", "Administrator"), email=email.lower(), password_hash=hash_password(password))
        db.session.add(admin)
        db.session.commit()


@event.listens_for(Engine, "connect")
def enable_sqlite_foreign_keys(connection, _):
    if connection.__class__.__module__.startswith("sqlite3"):
        connection.execute("PRAGMA foreign_keys=ON")


app = create_app()

if __name__ == "__main__":
    if Config.ENVIRONMENT == "production":
        raise RuntimeError(
            "Do not use Flask's development server in production. "
            "Start the WSGI app with: waitress-serve --listen=0.0.0.0:5000 wsgi:app"
        )
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=Config.ENVIRONMENT == "development")
