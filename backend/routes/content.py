"""Public catalogue endpoints and protected catalogue management."""
from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from models import db, ContentItem
from utils.api import success, payload, admin_required

content_bp = Blueprint("content", __name__, url_prefix="/api")
RESOURCE_TYPES = {"careers", "domains", "colleges", "scholarships", "exams", "resources", "stories", "faqs", "resume-templates"}


def valid_type(resource_type):
    return resource_type in RESOURCE_TYPES


@content_bp.get("/<resource_type>")
def list_items(resource_type):
    if not valid_type(resource_type):
        return {"success": False, "error": "Unknown resource type."}, 404
    items = ContentItem.query.filter_by(resource_type=resource_type).order_by(ContentItem.id.desc()).all()
    query = request.args.get("q", "").lower().strip()
    records = [item.to_dict() for item in items]
    if query:
        records = [item for item in records if query in str(item).lower()]
    return success(records)


@content_bp.get("/<resource_type>/<int:item_id>")
def get_item(resource_type, item_id):
    if not valid_type(resource_type):
        return {"success": False, "error": "Unknown resource type."}, 404
    item = ContentItem.query.filter_by(id=item_id, resource_type=resource_type).first()
    if not item:
        return {"success": False, "error": "Record not found."}, 404
    return success(item.to_dict())


@content_bp.post("/<resource_type>")
@jwt_required()
@admin_required
def create_item(resource_type):
    if not valid_type(resource_type):
        return {"success": False, "error": "Unknown resource type."}, 404
    data, error = payload()
    if error:
        return error
    data.pop("id", None)
    item = ContentItem(resource_type=resource_type, data=data)
    db.session.add(item)
    db.session.commit()
    return success(item.to_dict(), "Record created.", 201)


@content_bp.put("/<resource_type>/<int:item_id>")
@jwt_required()
@admin_required
def update_item(resource_type, item_id):
    if not valid_type(resource_type):
        return {"success": False, "error": "Unknown resource type."}, 404
    data, error = payload()
    if error:
        return error
    item = ContentItem.query.filter_by(id=item_id, resource_type=resource_type).first()
    if not item:
        return {"success": False, "error": "Record not found."}, 404
    data.pop("id", None)
    item.data = {**item.data, **data}
    db.session.commit()
    return success(item.to_dict(), "Record updated.")


@content_bp.delete("/<resource_type>/<int:item_id>")
@jwt_required()
@admin_required
def delete_item(resource_type, item_id):
    item = ContentItem.query.filter_by(id=item_id, resource_type=resource_type).first()
    if not item:
        return {"success": False, "error": "Record not found."}, 404
    db.session.delete(item)
    db.session.commit()
    return success(message="Record deleted.")
