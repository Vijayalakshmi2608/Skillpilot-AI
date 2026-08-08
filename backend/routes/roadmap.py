"""Student-owned roadmap routes."""
from flask import Blueprint,request
from flask_jwt_extended import jwt_required,get_jwt
from models import db,Roadmap
from routes import ok,json_body,role_required,current_id
roadmap_bp=Blueprint("roadmap",__name__,url_prefix="/api/roadmaps")
def out(x):return {"id":x.id,"studentId":x.student_id,"careerId":x.career_id,"title":x.title,"milestones":x.milestones,"progress":x.progress,"completed":x.is_completed}
@roadmap_bp.get("")
@jwt_required()
def listing():
 q=Roadmap.query; q=q.filter_by(student_id=current_id()) if get_jwt().get("role")=="student" else q;return ok([out(x) for x in q.all()])
@roadmap_bp.route("/<int:item_id>",methods=["GET","PUT"])
@jwt_required()
def item(item_id):
 x=db.session.get(Roadmap,item_id)
 if not x or (get_jwt().get("role")=="student" and x.student_id!=current_id()):return {"success":False,"error":"Roadmap not found."},404
 if request.method=="GET":return ok(out(x))
 d,e=json_body();
 if e:return e
 if get_jwt().get("role")=="student" and any(k in d for k in ("studentId","careerId","title")):return {"success":False,"error":"Students may update progress only."},403
 for k,a in {"title":"title","milestones":"milestones","progress":"progress","completed":"is_completed"}.items():
  if k in d:setattr(x,a,d[k])
 db.session.commit();return ok(out(x))
@roadmap_bp.post("")
@jwt_required()
@role_required("admin")
def create():
 d,e=json_body(("studentId","careerId","title"));
 if e:return e
 x=Roadmap(student_id=d["studentId"],career_id=d["careerId"],title=d["title"],milestones=d.get("milestones",[]));db.session.add(x);db.session.commit();return ok(out(x),status=201)
