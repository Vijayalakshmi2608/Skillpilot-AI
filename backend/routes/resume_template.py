"""Public resume-template discovery and administrator CRUD routes."""
from flask import Blueprint,request
from flask_jwt_extended import jwt_required,get_jwt
from models import db,ResumeTemplate
from routes import ok,json_body,role_required,current_id
resume_template_bp=Blueprint("resume_template",__name__,url_prefix="/api/resume-templates")
def out(x):return {"id":x.id,"name":x.name,"description":x.description,"accentColor":x.accent_color,"layout":x.layout}
@resume_template_bp.get("")
def listing():return ok([out(x) for x in ResumeTemplate.query.filter_by(is_active=True).all()])
@resume_template_bp.route("/<int:item_id>",methods=["GET","PUT","DELETE"])
@jwt_required(optional=True)
def item(item_id):
 x=db.session.get(ResumeTemplate,item_id)
 if not x:return {"success":False,"error":"Resume template not found."},404
 if request.method=="GET":return ok(out(x))
 if not get_jwt():return {"success":False,"error":"Authentication is required."},401
 if get_jwt().get("role")!="admin":return {"success":False,"error":"Admin access required."},403
 if request.method=="DELETE":db.session.delete(x);db.session.commit();return ok(message="Resume template deleted.")
 d,e=json_body();
 if e:return e
 for k,a in {"name":"name","description":"description","accentColor":"accent_color","layout":"layout"}.items():
  if k in d:setattr(x,a,d[k])
 db.session.commit();return ok(out(x))
@resume_template_bp.post("")
@jwt_required()
@role_required("admin")
def create():
 d,e=json_body(("name",));
 if e:return e
 x=ResumeTemplate(admin_id=current_id(),name=d["name"],description=d.get("description"),accent_color=d.get("accentColor","#2563EB"),layout=d.get("layout",{}));db.session.add(x);db.session.commit();return ok(out(x),status=201)
