"""
Helpers to build consistent JSON responses.
"""
from flask import jsonify


def ok(data=None):
    return jsonify({"status": "ok", "data": data or {}}), 200


def created(data=None):
    return jsonify({"status": "created", "data": data or {}}), 201


def error(message: str, code: int = 400):
    return jsonify({"status": "error", "message": message}), code
