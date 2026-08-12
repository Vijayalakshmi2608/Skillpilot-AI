"""Entrance-exam listing, filtering, and admin CRUD routes."""
from flask import Blueprint,request
from flask_jwt_extended import jwt_required,get_jwt
from models import db,EntranceExam
from routes import ok,json_body,role_required
entrance_exam_bp=Blueprint("entrance_exam",__name__,url_prefix="/api/entrance-exams")
def out(x):return {"id":x.id,"domainId":x.domain_id,"name":x.name,"conductingBody":x.conducting_body,"level":x.level,"mode":x.mode,"examDate":x.exam_date.isoformat() if x.exam_date else None,"registrationDeadline":x.registration_deadline.isoformat() if x.registration_deadline else None,"seats":x.seats,"officialUrl":x.official_url}
@entrance_exam_bp.get("")
def listing():
 q=EntranceExam.query.filter_by(is_active=True);domain=request.args.get("domain_id",type=int);level=request.args.get("level");q=q.filter_by(domain_id=domain) if domain else q;q=q.filter_by(level=level) if level else q;return ok([out(x) for x in q.all()])
@entrance_exam_bp.route("/<int:item_id>",methods=["GET","PUT","DELETE"])
@jwt_required(optional=True)
def item(item_id):
 x=db.session.get(EntranceExam,item_id)
 if not x:return {"success":False,"error":"Entrance exam not found."},404
 if request.method=="GET":return ok(out(x))
 if not get_jwt():return {"success":False,"error":"Authentication is required."},401
 if get_jwt().get("role")!="admin":return {"success":False,"error":"Admin access required."},403
 if request.method=="DELETE":db.session.delete(x);db.session.commit();return ok(message="Entrance exam deleted.")
 d,e=json_body();
 if e:return e
 for k,a in {"name":"name","conductingBody":"conducting_body","level":"level","mode":"mode","seats":"seats","officialUrl":"official_url","domainId":"domain_id"}.items():
  if k in d:setattr(x,a,d[k])
 db.session.commit();return ok(out(x))
@entrance_exam_bp.post("")
@jwt_required()
@role_required("admin")
def create():
 d,e=json_body(("domainId","name","conductingBody","level","mode"));
 if e:return e
 x=EntranceExam(domain_id=d["domainId"],name=d["name"],conducting_body=d["conductingBody"],level=d["level"],mode=d["mode"],seats=d.get("seats"),official_url=d.get("officialUrl"));db.session.add(x);db.session.commit();return ok(out(x),status=201)
