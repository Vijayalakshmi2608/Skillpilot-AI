"""Student recommendation retrieval and admin recommendation management."""
from flask import Blueprint,request
from flask_jwt_extended import jwt_required,get_jwt
from models import db,Recommendation
from routes import ok,json_body,role_required,current_id
recommendation_bp=Blueprint("recommendation",__name__,url_prefix="/api/recommendations")
def out(x):return {"id":x.id,"studentId":x.student_id,"assessmentId":x.assessment_id,"careerId":x.career_id,"matchScore":x.match_score,"rationale":x.rationale,"saved":x.is_saved}
@recommendation_bp.get("")
@jwt_required()
def listing():
 q=Recommendation.query; q=q.filter_by(student_id=current_id()) if get_jwt().get("role")=="student" else q; return ok([out(x) for x in q.all()])
@recommendation_bp.route("/<int:item_id>",methods=["GET","PUT"])
@jwt_required()
def item(item_id):
 x=db.session.get(Recommendation,item_id)
 if not x or (get_jwt().get("role")=="student" and x.student_id!=current_id()):return {"success":False,"error":"Recommendation not found."},404
 if request.method=="GET":return ok(out(x))
 if get_jwt().get("role")!="admin":return {"success":False,"error":"Admin access required."},403
 d,e=json_body();
 if e:return e
 for k,a in {"matchScore":"match_score","rationale":"rationale","saved":"is_saved"}.items():
  if k in d:setattr(x,a,d[k])
 db.session.commit();return ok(out(x))
@recommendation_bp.post("")
@jwt_required()
@role_required("admin")
def create():
 d,e=json_body(("studentId","assessmentId","careerId","matchScore"));
 if e:return e
 x=Recommendation(student_id=d["studentId"],assessment_id=d["assessmentId"],career_id=d["careerId"],match_score=d["matchScore"],rationale=d.get("rationale"));db.session.add(x);db.session.commit();return ok(out(x),status=201)
