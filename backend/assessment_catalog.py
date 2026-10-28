"""Built-in assessment questions, inserted safely when a database is empty."""
from models import AssessmentOption, AssessmentQuestion, db


ASSESSMENT_QUESTIONS = [
    ("Which activity do you enjoy most?", "interests", [
        ("Solving technical problems", "technology"),
        ("Helping people directly", "health"),
        ("Creating visual work", "design"),
        ("Leading teams and businesses", "business"),
    ]),
    ("Which school subject best matches your strengths?", "aptitude", [
        ("Mathematics", "technology"), ("Biology", "health"),
        ("Economics", "business"), ("Languages", "humanities"),
    ]),
    ("What kind of work environment do you prefer?", "work_style", [
        ("Laboratory or research centre", "research"),
        ("Office and technology team", "technology"),
        ("Outdoor or field work", "field"), ("Creative studio", "design"),
    ]),
    ("How do you prefer to solve a new problem?", "aptitude", [
        ("Analyse data", "data"), ("Build and test a prototype", "engineering"),
        ("Discuss with people", "communication"), ("Study rules and evidence", "law"),
    ]),
    ("What matters most in a career?", "values", [
        ("Social impact", "public_service"), ("Innovation", "technology"),
        ("Financial growth", "business"), ("Creative expression", "design"),
    ]),
    ("Which project would you choose?", "interests", [
        ("Build a robot", "robotics"), ("Plan a community health camp", "health"),
        ("Design a mobile app", "technology"), ("Write a news story", "media"),
    ]),
    ("How comfortable are you with public speaking?", "communication", [
        ("Very comfortable", "leadership"), ("Comfortable with preparation", "communication"),
        ("Prefer written communication", "research"), ("Prefer hands-on work", "technical"),
    ]),
    ("Which challenge interests you most?", "interests", [
        ("Protecting digital systems", "security"), ("Improving the environment", "sustainability"),
        ("Managing investments", "finance"), ("Teaching young learners", "education"),
    ]),
]


def seed_assessments():
    """Insert missing built-in questions/options without changing existing data."""
    created = 0
    for display_order, (question_text, category, options) in enumerate(ASSESSMENT_QUESTIONS, start=1):
        question = AssessmentQuestion.query.filter_by(question=question_text).first()
        if question is None:
            question = AssessmentQuestion(
                question=question_text,
                category=category,
                display_order=display_order,
                is_active=True,
            )
            db.session.add(question)
            db.session.flush()
            created += 1
        for option_order, (option_text, value) in enumerate(options, start=1):
            option = AssessmentOption.query.filter_by(
                question_id=question.id,
                display_order=option_order,
            ).first()
            if option is None:
                db.session.add(AssessmentOption(
                    question_id=question.id,
                    option_text=option_text,
                    value=value,
                    display_order=option_order,
                ))
    return created
