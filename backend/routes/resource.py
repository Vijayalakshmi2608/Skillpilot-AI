"""Learning-resource listing and administrator CRUD routes."""
from flask import Blueprint,request
from flask_jwt_extended import jwt_required,get_jwt
from models import db,Resource
from routes import ok,json_body,role_required
resource_bp=Blueprint("resource",__name__,url_prefix="/api/resources")
def out(x):return {"id":x.id,"domainId":x.domain_id,"title":x.title,"type":x.resource_type,"level":x.level,"provider":x.provider,"url":x.url,"rating":x.rating,"description":x.description}
@resource_bp.get("")
def listing():
 q=Resource.query.filter_by(is_published=True); domain=request.args.get("domain_id",type=int);level=request.args.get("level");q=q.filter_by(domain_id=domain) if domain else q;q=q.filter_by(level=level) if level else q;return ok([out(x) for x in q.all()])
@resource_bp.route("/<int:item_id>",methods=["GET","PUT","DELETE"])
@jwt_required(optional=True)
def item(item_id):
 x=db.session.get(Resource,item_id)
 if not x:return {"success":False,"error":"Resource not found."},404
 if request.method=="GET":return ok(out(x))
 if not get_jwt():return {"success":False,"error":"Authentication is required."},401
 if get_jwt().get("role")!="admin":return {"success":False,"error":"Admin access required."},403
 if request.method=="DELETE":db.session.delete(x);db.session.commit();return ok(message="Resource deleted.")
 d,e=json_body();
 if e:return e
 for k,a in {"title":"title","type":"resource_type","level":"level","provider":"provider","url":"url","rating":"rating","description":"description","domainId":"domain_id"}.items():
  if k in d:setattr(x,a,d[k])
 db.session.commit();return ok(out(x))
@resource_bp.post("")
@jwt_required()
@role_required("admin")
def create():
 d,e=json_body(("title","type","level","url"));
 if e:return e
 x=Resource(title=d["title"],resource_type=d["type"],level=d["level"],url=d["url"],domain_id=d.get("domainId"),provider=d.get("provider"),rating=d.get("rating"),description=d.get("description"));db.session.add(x);db.session.commit();return ok(out(x),status=201)
