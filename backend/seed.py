"""Initialize the existing SQLite schema and insert idempotent development seed data.

Run from the backend directory: ``py -3.11 seed.py``.
The script never drops tables or deletes application data.
"""
import os
from datetime import date, datetime, timezone
from sqlalchemy import inspect, text
from sqlalchemy.exc import SQLAlchemyError
from app import app
from models import (db, Admin, Student, CareerDomain, Career, College, Scholarship,
                    Assessment, Recommendation, Roadmap, Resource, Notification,
                    EntranceExam, ResumeTemplate)
from utils.auth import hash_password


def first_or_create(model, defaults=None, **lookup):
    """Return an existing row matching a stable key or add a new row to the session."""
    row = model.query.filter_by(**lookup).first()
    if row is None:
        row = model(**lookup, **(defaults or {}))
        db.session.add(row)
    return row


def upgrade_legacy_sqlite_schema():
    """Non-destructively add columns required by the current notification model.

    ``create_all`` intentionally does not alter existing SQLite tables. This keeps a
    database created by an older project revision usable without dropping its data.
    """
    inspector = inspect(db.engine)
    if "notifications" not in inspector.get_table_names():
        return
    existing = {column["name"] for column in inspector.get_columns("notifications")}
    additions = {
        "student_id": "INTEGER", "admin_id": "INTEGER", "notification_type": "VARCHAR(30)",
        "is_read": "BOOLEAN NOT NULL DEFAULT 0", "read_at": "DATETIME", "updated_at": "DATETIME",
    }
    for column, ddl in additions.items():
        if column not in existing:
            db.session.execute(text(f"ALTER TABLE notifications ADD COLUMN {column} {ddl}"))
    db.session.commit()


def seed_database():
    """Create tables and add sample records in one safe transaction."""
    with app.app_context():
        # Importing models above registers every model before this call.
        db.create_all()
        upgrade_legacy_sqlite_schema()
        try:
            admin = first_or_create(
                Admin,
                {"full_name": os.getenv("SEED_ADMIN_NAME", "Development Administrator"),
                 "password_hash": hash_password(os.getenv("SEED_ADMIN_PASSWORD", "ChangeMe123!"))},
                email=os.getenv("SEED_ADMIN_EMAIL", "admin@skillpilot.local").lower(),
            )
            student = first_or_create(
                Student,
                {"full_name": os.getenv("SEED_STUDENT_NAME", "Aarav Sharma"),
                 "password_hash": hash_password(os.getenv("SEED_STUDENT_PASSWORD", "ChangeMe123!")),
                 "stream": "PCM", "city": "Chennai", "school": "DAV Senior Secondary School", "board_score": 92.0},
                email=os.getenv("SEED_STUDENT_EMAIL", "student@skillpilot.local").lower(),
            )
            db.session.flush()

            technology = first_or_create(CareerDomain, {"description": "Computing, data, and emerging technology careers.", "icon": "cpu"}, name="Technology", slug="technology")
            healthcare = first_or_create(CareerDomain, {"description": "Clinical, research, and allied health careers.", "icon": "heart-pulse"}, name="Healthcare", slug="healthcare")
            db.session.flush()

            engineer = first_or_create(Career, {"domain_id": technology.id, "description": "Builds reliable software products and services.", "salary_range": "₹6–18 LPA", "demand_score": 92, "growth_rate": 18.0, "skills": ["Python", "SQL", "Data Structures"], "education_path": ["Class 12 PCM", "B.Tech/BS", "Portfolio projects"]}, title="Software Engineer")
            analyst = first_or_create(Career, {"domain_id": technology.id, "description": "Uses data to guide business and product decisions.", "salary_range": "₹5–14 LPA", "demand_score": 88, "growth_rate": 22.0, "skills": ["Python", "Statistics", "SQL"], "education_path": ["Class 12 PCM", "Degree", "Analytics portfolio"]}, title="Data Analyst")
            doctor = first_or_create(Career, {"domain_id": healthcare.id, "description": "Diagnoses and treats patients in clinical practice.", "salary_range": "₹8–20 LPA", "demand_score": 85, "growth_rate": 12.0, "skills": ["Biology", "Communication", "Clinical reasoning"], "education_path": ["Class 12 PCB", "NEET", "MBBS"]}, title="Medical Doctor")
            db.session.flush()

            college = first_or_create(College, {"domain_id": technology.id, "state": "Tamil Nadu", "district": "Chennai", "college_type": "Government", "fees": 250000, "placement_percentage": 91.0, "rating": 4.6, "courses": ["Computer Science", "Data Science"]}, name="Indian Institute of Technology Madras")
            if engineer not in college.careers: college.careers.append(engineer)
            if analyst not in college.careers: college.careers.append(analyst)
            first_or_create(Scholarship, {"provider": "Government of India", "amount": 100000, "deadline": date(2026, 10, 31), "category": "Merit", "eligibility": ["Class 12 students", "Strong academic record"], "benefits": ["Tuition support", "Mentorship"], "application_url": "https://scholarships.gov.in"}, name="National Merit Scholarship")
            first_or_create(Resource, {"domain_id": technology.id, "resource_type": "Course", "level": "Beginner", "provider": "OpenLearn", "url": "https://www.open.edu/openlearn/", "duration_minutes": 480, "rating": 4.7, "description": "Introduction to programming and computational thinking."}, title="Programming Foundations")
            first_or_create(EntranceExam, {"domain_id": technology.id, "conducting_body": "National Testing Agency", "level": "UG Entrance", "mode": "Online", "exam_date": date(2026, 4, 15), "registration_deadline": date(2026, 2, 28), "seats": 15000, "official_url": "https://jeemain.nta.nic.in"}, name="JEE Main")
            first_or_create(ResumeTemplate, {"admin_id": admin.id, "description": "A clean, ATS-friendly starter resume for students.", "accent_color": "#2563EB", "layout": {"sections": ["Education", "Skills", "Projects"]}}, name="Modern Student")
            db.session.flush()

            assessment = Assessment.query.filter_by(student_id=student.id).first()
            if assessment is None:
                assessment = Assessment(student_id=student.id, answers={"interest": "technology", "strength": "problem-solving"}, scores={"technology": 91, "healthcare": 54}, completed_at=datetime.now(timezone.utc))
                db.session.add(assessment); db.session.flush()
            first_or_create(Recommendation, {"assessment_id": assessment.id, "match_score": 91.0, "rationale": "Strong analytical interests and PCM background.", "is_saved": True}, student_id=student.id, career_id=engineer.id)
            first_or_create(Roadmap, {"career_id": engineer.id, "milestones": ["Learn Python", "Build two projects", "Prepare entrance exams"], "progress": 25}, student_id=student.id, title="Software Engineering Roadmap")
            first_or_create(Notification, {"admin_id": admin.id, "message": "Your personalised software engineering roadmap is ready.", "notification_type": "career", "is_read": False, "legacy_type": "career", "legacy_read": False}, student_id=student.id, title="Welcome to SkillPilot")
            db.session.commit()
        except SQLAlchemyError:
            db.session.rollback()
            raise


if __name__ == "__main__":
    try:
        seed_database()
        print("Database initialized and seed data verified.")
    except SQLAlchemyError as error:
        # This is a CLI diagnostic only; no exception details are sent to API clients.
        print(f"Database initialization failed: {error.__class__.__name__}")
        raise SystemExit(1)
