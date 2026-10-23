"""End-to-end Flask test_client coverage for the currently registered API contract."""
from datetime import date
from pathlib import Path
import sys

import pytest
from flask_jwt_extended import create_access_token

# Tests run from the repository root, while application modules use the
# existing backend-as-import-root architecture.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import create_app
from models import (
    AssessmentOption,
    AssessmentQuestion,
    Career,
    CareerDomain,
    CareerRoadmap,
    College,
    Feedback,
    Scholarship,
    StudentProfile,
    User,
    db,
)


class TestConfig:
    TESTING = True
    SECRET_KEY = "test-secret-key-with-more-than-thirty-two-characters"
    JWT_SECRET_KEY = "test-jwt-secret-key-with-more-than-thirty-two-chars"
    SQLALCHEMY_DATABASE_URI = "sqlite://"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_ACCESS_TOKEN_EXPIRES = False
    JWT_REFRESH_TOKEN_EXPIRES = False
    CORS_ORIGINS = ["*"]
    JSON_SORT_KEYS = False
    MAX_CONTENT_LENGTH = 2 * 1024 * 1024

    @classmethod
    def validate_security(cls):
        return None


@pytest.fixture()
def app():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        domain = CareerDomain(name="Technology", slug="technology", description="Technology careers")
        db.session.add(domain)
        db.session.flush()
        career = Career(
            domain_id=domain.id, title="Validation Engineer", description="Builds reliable software.",
            eligibility="Class 12", skills=["Python", "Problem Solving"], salary_range="₹6–12 LPA",
            demand_score=90, growth_rate=12.5, education_path=["Degree", "Internship"], is_active=True,
        )
        college = College(name="Validation Institute", state="Tamil Nadu", district="Chennai", college_type="Engineering", fees=100000, cutoff="80", is_active=True)
        scholarship = Scholarship(name="Validation Scholarship", provider="Government of India", amount=50000, deadline=date(2027, 12, 31), category="Government", eligibility=["General", "Tamil Nadu", "Class 12"], benefits=["Fee support"], is_active=True)
        question = AssessmentQuestion(question="Do you enjoy building software?", category="technology", display_order=1, is_active=True)
        db.session.add_all([career, college, scholarship, question])
        db.session.flush()
        db.session.add_all([
            AssessmentOption(question_id=question.id, option_text="Yes", value="2", display_order=1),
            AssessmentOption(question_id=question.id, option_text="Sometimes", value="1", display_order=2),
        ])
        db.session.commit()
    yield app
    with app.app_context():
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


def _register(client, email="student@example.test"):
    response = client.post("/api/auth/register", json={"fullName": "Test Student", "email": email, "password": "SecurePass123!"})
    assert response.status_code == 201, response.get_json()
    return response.get_json()["data"]


def _authorization(token):
    return {"Authorization": f"Bearer {token}"}


def test_authentication_lifecycle_and_removed_auth_routes(client):
    account = _register(client)
    access, refresh = account["accessToken"], account["refreshToken"]
    assert client.post("/api/auth/register", json={"fullName": "Duplicate User", "email": "student@example.test", "password": "SecurePass123!"}).status_code == 409
    assert client.post("/api/auth/login", json={"email": "student@example.test", "password": "SecurePass123!"}).status_code == 200
    assert client.post("/api/auth/login", json={"email": "student@example.test", "password": "wrong"}).status_code == 401
    assert client.get("/api/auth/me", headers=_authorization(access)).status_code == 200
    assert client.post("/api/auth/refresh", headers=_authorization(refresh)).status_code == 200
    assert client.post("/api/auth/forgot-password", json={"email": "student@example.test"}).status_code == 202
    assert client.post("/api/auth/reset-password", json={"password": "AnotherSecure123!"}, headers=_authorization(access)).status_code == 200
    assert client.post("/api/auth/logout", headers=_authorization(access)).status_code == 200
    assert client.get("/api/auth/me", headers=_authorization(access)).status_code == 401
    # Parent/admin authentication was intentionally removed from the current contract.
    assert client.post("/api/auth/parents/register", json={}).status_code == 404
    assert client.post("/api/auth/admin/login", json={}).status_code == 404


def test_auth_input_validation_and_profile_ownership(client):
    assert client.post("/api/auth/register", json={"fullName": "A", "email": "bad", "password": "short"}).status_code == 400
    first = _register(client, "first@example.test")
    second = _register(client, "second@example.test")
    first_headers = _authorization(first["accessToken"])
    second_headers = _authorization(second["accessToken"])

    assert client.get("/api/students/me").status_code == 401
    assert client.get("/api/students/me", headers=first_headers).status_code == 200
    assert client.patch("/api/students/me", headers=first_headers, json={"fullName": 12}).status_code == 400
    assert client.patch("/api/students/me", headers=first_headers, json={"password_hash": "exposed"}).status_code == 400
    updated = client.patch("/api/students/me", headers=first_headers, json={
        "fullName": "Updated Student", "email": "FIRST@example.test", "city": "Pune",
        "schoolName": "Central School", "familyIncome": 120000,
    })
    assert updated.status_code == 200, updated.get_json()
    assert updated.get_json()["data"]["fullName"] == "Updated Student"
    assert updated.get_json()["data"]["profile"]["familyIncome"] == 120000
    assert client.get("/api/students/me", headers=second_headers).get_json()["data"]["fullName"] == "Test Student"
    assert client.patch("/api/students/me", headers=first_headers, json={"email": "second@example.test"}).status_code == 409


def test_profile_update_persists_across_app_restart(tmp_path):
    database_path = tmp_path / "auth-persistence.db"

    class FileConfig(TestConfig):
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{database_path.as_posix()}"

    first_app = create_app(FileConfig)
    first_client = first_app.test_client()
    account = _register(first_client, "persistent@example.test")
    headers = _authorization(account["accessToken"])
    saved = first_client.patch("/api/students/me", headers=headers, json={"city": "Jaipur", "schoolName": "North School"})
    assert saved.status_code == 200

    second_app = create_app(FileConfig)
    reloaded = second_app.test_client().get("/api/students/me", headers=headers)
    assert reloaded.status_code == 200
    assert reloaded.get_json()["data"]["city"] == "Jaipur"
    assert reloaded.get_json()["data"]["profile"]["schoolName"] == "North School"


def test_career_college_and_scholarship_apis(client, app):
    account = _register(client)
    headers = _authorization(account["accessToken"])
    with app.app_context():
        student = User.query.filter_by(email="student@example.test").one()
        career = Career.query.filter_by(title="Validation Engineer").one()
        db.session.add(StudentProfile(user_id=student.id, state="Tamil Nadu", district="Chennai", student_class="Class 12", category="General", family_income=200000))
        db.session.add(CareerRoadmap(user_id=student.id, career_id=career.id, title="Validation roadmap", milestones=["Learn"], progress=0))
        db.session.commit()
        career_id = career.id
        college_id = College.query.filter_by(name="Validation Institute").one().id
        scholarship_id = Scholarship.query.filter_by(name="Validation Scholarship").one().id

    for path in ("/api/careers", "/api/careers/search?q=Validation", "/api/careers/domain/technology", "/api/careers/recommendations", "/api/careers/trending", f"/api/careers/{career_id}", f"/api/careers/future-scope/{career_id}", f"/api/careers/skills/{career_id}", f"/api/careers/salary/{career_id}", f"/api/careers/roadmap/{career_id}"):
        response = client.get(path, headers=headers)
        assert response.status_code == 200, (path, response.get_json())
        assert response.is_json
    assert client.get("/api/careers", headers=None).status_code == 401
    assert client.get("/api/careers/search", headers=headers).status_code == 400
    assert client.post("/api/careers/compare", json={}, headers=headers).status_code == 404

    for path in ("/api/colleges", f"/api/colleges/{college_id}", "/api/colleges/search?keyword=Validation", "/api/colleges/filter?state=Tamil%20Nadu", "/api/colleges/top", "/api/colleges/states", "/api/colleges/districts?state=Tamil%20Nadu", "/api/colleges/types"):
        assert client.get(path).status_code == 200, path
    assert client.get("/api/colleges/recommended", headers=headers).status_code == 200
    assert client.get("/api/colleges/search").status_code == 400
    assert client.get("/api/colleges/999999").status_code == 404

    for path in ("/api/scholarships", f"/api/scholarships/{scholarship_id}", "/api/scholarships/search?keyword=Validation", "/api/scholarships/filter?category=Government", "/api/scholarships/latest", "/api/scholarships/government", "/api/scholarships/private"):
        assert client.get(path).status_code == 200, path
    assert client.get("/api/scholarships/eligible", headers=headers).status_code == 200
    assert client.get("/api/scholarships/search").status_code == 400
    assert client.get("/api/scholarships/999999").status_code == 404


def test_assessment_and_student_access(client, app):
    account = _register(client)
    headers = _authorization(account["accessToken"])
    questions = client.get("/api/assessment/questions")
    assert questions.status_code == 200
    question = questions.get_json()["data"][0]
    assert client.get(f"/api/assessment/questions/{question['id']}").status_code == 200
    assert client.post("/api/assessment/submit", json={"answers": [{"questionId": question["id"], "optionId": question["options"][0]["id"]}]}).status_code == 401
    submission = client.post("/api/assessment/submit", json={"answers": [{"questionId": question["id"], "optionId": question["options"][0]["id"]}]}, headers=headers)
    assert submission.status_code == 201, submission.get_json()
    assert client.get("/api/assessment/results", headers=headers).status_code == 200
    assert client.post("/api/assessment/submit", json={"answers": []}, headers=headers).status_code == 400
    assert client.get("/api/assessment/history", headers=headers).status_code == 404
    assert client.get("/api/assessment/skill-gap", headers=headers).status_code == 404
    with app.app_context():
        student = User.query.filter_by(email="student@example.test").one()
        career = Career.query.filter_by(title="Validation Engineer").one()
        db.session.add(CareerRoadmap(user_id=student.id, career_id=career.id, title="Assessment roadmap", milestones=["Learn"], progress=0))
        db.session.commit()
        assessment_career_id = career.id
    assert client.get(f"/api/assessment/roadmaps/{assessment_career_id}", headers=headers).status_code == 200
    assert client.get("/api/students/me", headers=headers).status_code == 200
    assert client.patch("/api/students/me", headers=headers, json={"city": "Chennai", "state": "Tamil Nadu"}).status_code == 200
    assert client.get("/api/students/me/recommendations", headers=headers).status_code == 200
    assert client.get("/api/students/me/roadmaps", headers=headers).status_code == 200
    assert client.get("/api/students/me/notifications", headers=headers).status_code == 200


def test_admin_apis_and_authorization(client, app):
    account = _register(client)
    student_headers = _authorization(account["accessToken"])
    assert client.get("/api/admin/dashboard", headers=student_headers).status_code == 403

    with app.app_context():
        admin = User(full_name="Admin", email="admin@example.test", password_hash="unused", role="admin")
        parent = User(full_name="Parent", email="parent@example.test", password_hash="unused", role="parent")
        disposable_student = User(full_name="Disposable", email="disposable@example.test", password_hash="unused", role="student")
        db.session.add_all([admin, parent, disposable_student])
        db.session.commit()
        admin_token = create_access_token(identity=str(admin.id), additional_claims={"role": "admin"})
        db.session.add(Feedback(user_id=admin.id, subject="Validation", message="Useful test feedback", rating=5))
        db.session.commit()
        parent_id, disposable_student_id = parent.id, disposable_student.id
    headers = _authorization(admin_token)
    for path in ("/api/admin/dashboard", "/api/admin/careers", "/api/admin/colleges", "/api/admin/scholarships", "/api/admin/students", "/api/admin/parents", "/api/admin/feedback", "/api/admin/notifications", "/api/admin/analytics", "/api/admin/system"):
        response = client.get(path, headers=headers)
        assert response.status_code == 200, (path, response.get_json())

    career = client.post("/api/admin/careers", headers=headers, json={"title": "Admin Validation Career", "description": "Created by API", "domainId": 1, "requiredSkills": ["Python"]})
    assert career.status_code == 201, career.get_json()
    career_id = career.get_json()["data"]["id"]
    assert client.put(f"/api/admin/careers/{career_id}", headers=headers, json={"growthRate": 9.5}).status_code == 200
    assert client.delete(f"/api/admin/careers/{career_id}", headers=headers).status_code == 200

    college = client.post("/api/admin/colleges", headers=headers, json={"name": "Admin Validation College", "state": "Delhi", "type": "Engineering"})
    assert college.status_code == 201, college.get_json()
    college_id = college.get_json()["data"]["id"]
    assert client.put(f"/api/admin/colleges/{college_id}", headers=headers, json={"fees": 1000}).status_code == 200
    assert client.delete(f"/api/admin/colleges/{college_id}", headers=headers).status_code == 200

    scholarship = client.post("/api/admin/scholarships", headers=headers, json={"title": "Admin Validation Scholarship", "provider": "Test Provider", "category": "Private", "eligibility": []})
    assert scholarship.status_code == 201, scholarship.get_json()
    scholarship_id = scholarship.get_json()["data"]["id"]
    assert client.put(f"/api/admin/scholarships/{scholarship_id}", headers=headers, json={"amount": 1000}).status_code == 200
    assert client.delete(f"/api/admin/scholarships/{scholarship_id}", headers=headers).status_code == 200

    notification = client.post("/api/admin/notifications", headers=headers, json={"title": "Notice", "message": "Validation message"})
    assert notification.status_code == 201, notification.get_json()
    assert client.delete(f"/api/admin/notifications/{notification.get_json()['data']['id']}", headers=headers).status_code == 200

    assert client.get(f"/api/admin/parents/{parent_id}", headers=headers).status_code == 200
    assert client.put(f"/api/admin/parents/{parent_id}", headers=headers, json={"city": "Pune"}).status_code == 200
    assert client.delete(f"/api/admin/parents/{parent_id}", headers=headers).status_code == 200
    assert client.get(f"/api/admin/students/{disposable_student_id}", headers=headers).status_code == 200
    assert client.put(f"/api/admin/students/{disposable_student_id}", headers=headers, json={"city": "Mumbai"}).status_code == 200
    assert client.delete(f"/api/admin/students/{disposable_student_id}", headers=headers).status_code == 200
    feedback_id = client.get("/api/admin/feedback", headers=headers).get_json()["data"][0]["id"]
    assert client.delete(f"/api/admin/feedback/{feedback_id}", headers=headers).status_code == 200
