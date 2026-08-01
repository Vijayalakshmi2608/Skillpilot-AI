"""
Flask application factory and entrypoint.
Creates and configures the Flask app, initializes extensions and registers blueprints.
All responses are JSON. CORS and JWT are configured here.
"""
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models import db
import config


def create_app(config_object: str = "config.Config") -> Flask:
    """Create and configure the Flask application.

    Args:
        config_object: import path or object for configuration (default: config.Config)
    Returns:
        Configured Flask app
    """
    app = Flask(__name__, static_folder=None)

    # Load configuration
    app.config.from_object(config_object)

    # Enable CORS for all domains on all routes. The React frontend needs this.
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Initialize extensions
    db.init_app(app)
    JWTManager(app)

    # Register blueprints
    from routes.auth import auth_bp
    from routes.users import users_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")

    # Ensure database exists and create tables
    with app.app_context():
        db.create_all()

    # Health check route
    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok"}), 200

    # JSON error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Not Found", "message": str(e)}), 404

    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": "Bad Request", "message": str(e)}), 400

    @app.errorhandler(500)
    def internal_error(e):
        # Do not expose internal exception details in production
        return jsonify({"error": "Internal Server Error", "message": "An unexpected error occurred."}), 500

    return app


# Run when invoked directly for local development/testing
if __name__ == "__main__":
    application = create_app()
    application.run(host="0.0.0.0", port=5000)
