"""Tests for the AI career recommendation endpoint."""
import json
from unittest.mock import MagicMock, patch

import pytest
from flask_jwt_extended import create_access_token

sys_path_set = False


def _ensure_sys_path():
    global sys_path_set
    if not sys_path_set:
        import sys
        from pathlib import Path
        sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
        sys_path_set = True


_ensure_sys_path()

from app import create_app  # noqa: E402
from config import Config  # noqa: E402
from models import User, db  # noqa: E402


class TestAIConfig:
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
    OPENROUTER_API_KEY = "sk-test-key"
    OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
    OPENROUTER_MODEL = "test-model"
    OPENROUTER_TIMEOUT = 30
    OPENROUTER_MAX_RETRIES = 2

    @classmethod
    def validate_security(cls):
        return None


@pytest.fixture()
def app():
    app = create_app(TestAIConfig)
    with app.app_context():
        db.create_all()
    yield app
    with app.app_context():
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


def _register_and_login(client):
    response = client.post("/api/auth/register", json={
        "fullName": "AI Test Student",
        "email": "ai-student@example.test",
        "password": "SecurePass123!",
    })
    assert response.status_code == 201
    return response.get_json()["data"]["accessToken"]


def _auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


VALID_PAYLOAD = {
    "name": "AI Test Student",
    "class": "Class 12",
    "stream": "Science",
    "marks": 92,
    "skills": ["Python", "Data Analysis", "Communication"],
    "interests": ["Technology", "Research"],
    "personality": "Analytical and curious",
    "favouriteSubjects": ["Mathematics", "Physics", "Computer Science"],
    "careerGoal": "Become a data scientist",
    "budget": "₹10 lakhs",
    "preferredLocation": "Bangalore",
    "preferredStudyType": "Undergraduate",
}


def _build_mock_response():
    return {
        "content": json.dumps({
            "recommendations": [
                {
                    "careerName": "Data Scientist",
                    "whyThisCareerMatches": "Strong analytical skills and interest in technology.",
                    "matchScore": 95,
                    "requiredDegree": "B.Tech / B.Sc in Computer Science or Statistics",
                    "requiredSkills": ["Python", "Machine Learning", "Statistics"],
                    "salaryRange": "₹10–25 LPA",
                    "futureDemand": "Very High",
                    "advantages": ["High salary", "Remote work options", "Growing field"],
                    "challenges": ["Continuous learning required", "High competition"],
                    "requiredCertifications": ["AWS ML Specialty", "Google Data Analytics"],
                    "suggestedProjects": ["Customer churn prediction", "Image classification model"],
                    "internships": ["Data Science intern at tech companies", "Research assistant"],
                    "higherStudies": ["M.Tech in AI/ML", "MS in Data Science abroad"],
                    "topCompanies": ["Google", "Microsoft", "Amazon", "Flipkart", "Swiggy"],
                    "roadmapSummary": "Learn Python and statistics -> Build projects -> Intern -> Full-time role.",
                },
                {
                    "careerName": "Software Engineer",
                    "whyThisCareerMatches": "Strong CS background and problem-solving skills.",
                    "matchScore": 90,
                    "requiredDegree": "B.Tech in Computer Science",
                    "requiredSkills": ["Data Structures", "Algorithms", "System Design"],
                    "salaryRange": "₹8–30 LPA",
                    "futureDemand": "High",
                    "advantages": ["Diverse opportunities", "Good work-life balance"],
                    "challenges": ["Rapidly changing tech stack"],
                    "requiredCertifications": ["AWS Developer", "GCP Engineer"],
                    "suggestedProjects": ["E-commerce platform", "Chat application"],
                    "internships": ["SDE intern at startups", "Open source contributor"],
                    "higherStudies": ["MS in Software Engineering"],
                    "topCompanies": ["Google", "Microsoft", "Adobe", "Zomato", "Paytm"],
                    "roadmapSummary": "Master DSA -> Contribute to open source -> Intern -> Full-time SDE.",
                },
                {
                    "careerName": "Product Manager",
                    "whyThisCareerMatches": "Combines technical knowledge with business acumen.",
                    "matchScore": 85,
                    "requiredDegree": "B.Tech + MBA preferred",
                    "requiredSkills": ["Product Strategy", "User Research", "Analytics"],
                    "salaryRange": "₹12–35 LPA",
                    "futureDemand": "High",
                    "advantages": ["High impact", "Leadership opportunities"],
                    "challenges": ["Cross-team coordination stress"],
                    "requiredCertifications": ["CSPO", "Pragmatic Marketing"],
                    "suggestedProjects": ["Launch a mini-product", "User research study"],
                    "internships": ["Product management intern", "Business analyst intern"],
                    "higherStudies": ["MBA from top B-school"],
                    "topCompanies": ["Google", "Amazon", "Flipkart", "CRED", "Razorpay"],
                    "roadmapSummary": "Gain tech experience -> Learn product frameworks -> Transition to PM role.",
                },
                {
                    "careerName": "Cybersecurity Analyst",
                    "whyThisCareerMatches": "Attention to detail and interest in security.",
                    "matchScore": 82,
                    "requiredDegree": "B.Tech / B.Sc in Cybersecurity or IT",
                    "requiredSkills": ["Network Security", "Ethical Hacking", "SIEM Tools"],
                    "salaryRange": "₹6–20 LPA",
                    "futureDemand": "Very High",
                    "advantages": ["Job security", "Critical role in organisations"],
                    "challenges": ["High stress during incidents", "On-call shifts"],
                    "requiredCertifications": ["CEH", "CISSP", "CompTIA Security+"],
                    "suggestedProjects": ["Build a SIEM dashboard", "Penetration testing report"],
                    "internships": ["Security analyst intern", "SOC intern"],
                    "higherStudies": ["M.Tech in Cybersecurity"],
                    "topCompanies": ["CrowdStrike", "Palo Alto Networks", "TCS", "Wipro", "Infosys"],
                    "roadmapSummary": "Learn networking -> Get CEH certification -> SOC role -> Senior analyst.",
                },
                {
                    "careerName": "AI/ML Engineer",
                    "whyThisCareerMatches": "Interest in AI and strong mathematical foundation.",
                    "matchScore": 88,
                    "requiredDegree": "B.Tech / M.Tech in AI/ML or CS",
                    "requiredSkills": ["Deep Learning", "NLP", "MLOps"],
                    "salaryRange": "₹12–40 LPA",
                    "futureDemand": "Very High",
                    "advantages": ["Cutting-edge work", "High salary growth"],
                    "challenges": ["Requires advanced degree for top roles", "Fast-evolving field"],
                    "requiredCertifications": ["TensorFlow Developer", "AWS ML Specialty"],
                    "suggestedProjects": ["LLM fine-tuning", "Computer vision application"],
                    "internships": ["AI research intern", "ML engineer intern"],
                    "higherStudies": ["M.Tech in AI/ML", "PhD in Machine Learning"],
                    "topCompanies": ["Google DeepMind", "OpenAI", "Microsoft", "Adobe", "PhonePe"],
                    "roadmapSummary": "Learn ML fundamentals -> Specialize in deep learning -> Research or industry role.",
                },
            ]
        })
    }


def test_career_recommendation_success(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    with patch("routes.ai.OpenRouterClient") as MockClient:
        mock_instance = MockClient.return_value
        mock_instance.chat_completion.return_value = _build_mock_response()

        response = client.post("/api/ai/career-recommendation", json=VALID_PAYLOAD, headers=headers)

    assert response.status_code == 200
    body = response.get_json()
    assert body["success"] is True
    assert "recommendations" in body["data"]
    assert len(body["data"]["recommendations"]) == 5
    rec = body["data"]["recommendations"][0]
    assert rec["careerName"] == "Data Scientist"
    assert rec["matchScore"] == 95
    assert isinstance(rec["requiredSkills"], list)
    assert isinstance(rec["topCompanies"], list)
    assert len(rec["topCompanies"]) == 5


def test_career_recommendation_requires_auth(client):
    response = client.post("/api/ai/career-recommendation", json=VALID_PAYLOAD)
    assert response.status_code == 401


def test_career_recommendation_validation_errors(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    invalid_payloads = [
        ({}, "Missing required fields"),
        ({"name": "A", "class": "Class 12", "stream": "Science", "marks": 92, "skills": "not-a-list", "interests": ["Tech"], "personality": "OK", "favouriteSubjects": ["Math"], "careerGoal": "Doctor", "budget": "5L", "preferredLocation": "Delhi", "preferredStudyType": "UG"}, "skills must be a list"),
        ({"name": "A", "class": "Class 12", "stream": "Science", "marks": 150, "skills": ["Python"], "interests": ["Tech"], "personality": "OK", "favouriteSubjects": ["Math"], "careerGoal": "Doctor", "budget": "5L", "preferredLocation": "Delhi", "preferredStudyType": "UG"}, "marks out of range"),
        ({"name": "AB", "class": "", "stream": "Science", "marks": 92, "skills": ["Python"], "interests": ["Tech"], "personality": "OK", "favouriteSubjects": ["Math"], "careerGoal": "Doctor", "budget": "5L", "preferredLocation": "Delhi", "preferredStudyType": "UG"}, "empty class"),
    ]

    for payload, description in invalid_payloads:
        response = client.post("/api/ai/career-recommendation", json=payload, headers=headers)
        assert response.status_code == 422, f"Expected 422 for: {description}"


def test_career_recommendation_openrouter_rate_limit(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    with patch("routes.ai.OpenRouterClient") as MockClient:
        from utils.openrouter import OpenRouterRateLimitError
        mock_instance = MockClient.return_value
        mock_instance.chat_completion.side_effect = OpenRouterRateLimitError("Rate limited.")

        response = client.post("/api/ai/career-recommendation", json=VALID_PAYLOAD, headers=headers)

    assert response.status_code == 429
    body = response.get_json()
    assert body["success"] is False


def test_career_recommendation_openrouter_timeout(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    with patch("routes.ai.OpenRouterClient") as MockClient:
        from utils.openrouter import OpenRouterTimeoutError
        mock_instance = MockClient.return_value
        mock_instance.chat_completion.side_effect = OpenRouterTimeoutError("Timed out.")

        response = client.post("/api/ai/career-recommendation", json=VALID_PAYLOAD, headers=headers)

    assert response.status_code == 504
    body = response.get_json()
    assert body["success"] is False


def test_career_recommendation_invalid_json_response(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    with patch("routes.ai.OpenRouterClient") as MockClient:
        mock_instance = MockClient.return_value
        mock_instance.chat_completion.return_value = {"content": "This is not JSON at all."}

        response = client.post("/api/ai/career-recommendation", json=VALID_PAYLOAD, headers=headers)

    assert response.status_code == 500
    body = response.get_json()
    assert body["success"] is False


def test_career_recommendation_missing_api_key(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    original_key = Config.OPENROUTER_API_KEY
    try:
        Config.OPENROUTER_API_KEY = None
        response = client.post("/api/ai/career-recommendation", json=VALID_PAYLOAD, headers=headers)
        assert response.status_code == 500
        body = response.get_json()
        assert body["success"] is False
    finally:
        Config.OPENROUTER_API_KEY = original_key


def test_career_recommendation_strips_markdown_code_fences(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    mock_response = _build_mock_response()
    mock_response["content"] = "```json\n" + mock_response["content"] + "\n```"

    with patch("routes.ai.OpenRouterClient") as MockClient:
        mock_instance = MockClient.return_value
        mock_instance.chat_completion.return_value = mock_response

        response = client.post("/api/ai/career-recommendation", json=VALID_PAYLOAD, headers=headers)

    assert response.status_code == 200
    body = response.get_json()
    assert body["success"] is True
    assert len(body["data"]["recommendations"]) == 5


# ---------------------------------------------------------------------------
# AI Career Roadmap tests
# ---------------------------------------------------------------------------

ROADMAP_PAYLOAD = {
    "name": "AI Test Student",
    "selectedCareer": "Data Scientist",
    "currentSkills": ["Python", "Math"],
    "currentEducation": "Class 12",
    "budget": "₹10 lakhs",
    "location": "Bangalore",
    "careerGoal": "Become a data scientist",
}


def _build_roadmap_mock_response():
    return {
        "content": json.dumps({
            "roadmap": {
                "entranceExams": [{"name": "JEE Main", "eligibility": "Class 12", "prepTips": "Focus on Physics, Chemistry, Math"}],
                "degreeSelection": [{"degree": "B.Tech in CS", "reason": "Strong foundation in programming"}],
                "semesterWiseLearning": [{"semester": "Sem 1", "focus": "Python programming"}],
                "certifications": [{"name": "Python for Everybody", "timeline": "Month 1-2"}],
                "projects": [{"name": "Data analysis project", "difficulty": "Beginner"}],
                "internships": [{"company": "Tech startup", "type": "Data Science intern"}],
                "hackathons": [{"name": "HackWithIndia", "type": "AI/ML"}],
                "portfolio": [{"item": "GitHub profile with 5 projects"}],
                "resumePreparation": ["Build ATS-friendly resume", "Highlight projects"],
                "placementPreparation": ["Practice coding", "Mock interviews"],
                "interviewPreparation": ["System design", "ML concepts"],
                "higherStudies": [{"option": "M.Tech in AI/ML", "benefit": "Advanced research opportunities"}],
                "estimatedTimeline": "4 years",
                "monthlyGoals": ["Month 1: Learn Python basics", "Month 2: Data structures"],
                "yearlyGoals": ["Year 1: Complete B.Tech first year", "Year 2: Build 3 projects"],
                "freeResources": ["Kaggle Learn", "MIT OpenCourseWare"],
                "paidResources": ["Coursera ML Specialization", "Udemy Python Bootcamp"],
                "tips": ["Consistency over intensity", "Build real projects"],
            }
        })
    }


def test_career_roadmap_success(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    with patch("routes.ai.OpenRouterClient") as MockClient:
        mock_instance = MockClient.return_value
        mock_instance.chat_completion.return_value = _build_roadmap_mock_response()

        response = client.post("/api/ai/roadmap", json=ROADMAP_PAYLOAD, headers=headers)

    assert response.status_code == 200
    body = response.get_json()
    assert body["success"] is True
    assert "roadmap" in body["data"]
    assert body["data"]["roadmap"]["estimatedTimeline"] == "4 years"
    assert len(body["data"]["roadmap"]["monthlyGoals"]) == 2


def test_career_roadmap_requires_auth(client):
    response = client.post("/api/ai/roadmap", json=ROADMAP_PAYLOAD)
    assert response.status_code == 401


def test_career_roadmap_validation_errors(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    invalid_payloads = [
        ({}, "Missing required fields"),
        ({"name": "A", "selectedCareer": "Data Scientist", "currentEducation": "Class 12", "budget": "5L", "location": "Delhi", "careerGoal": "Doctor"}, "Missing currentSkills"),
        ({"name": "A", "selectedCareer": "Data Scientist", "currentEducation": "Class 12", "currentSkills": "not-a-list", "budget": "5L", "location": "Delhi", "careerGoal": "Doctor"}, "currentSkills must be list"),
    ]

    for payload, description in invalid_payloads:
        response = client.post("/api/ai/roadmap", json=payload, headers=headers)
        assert response.status_code == 422, f"Expected 422 for: {description}"


def test_career_roadmap_openrouter_rate_limit(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    with patch("routes.ai.OpenRouterClient") as MockClient:
        from utils.openrouter import OpenRouterRateLimitError
        mock_instance = MockClient.return_value
        mock_instance.chat_completion.side_effect = OpenRouterRateLimitError("Rate limited.")

        response = client.post("/api/ai/roadmap", json=ROADMAP_PAYLOAD, headers=headers)

    assert response.status_code == 429


def test_career_roadmap_openrouter_timeout(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    with patch("routes.ai.OpenRouterClient") as MockClient:
        from utils.openrouter import OpenRouterTimeoutError
        mock_instance = MockClient.return_value
        mock_instance.chat_completion.side_effect = OpenRouterTimeoutError("Timed out.")

        response = client.post("/api/ai/roadmap", json=ROADMAP_PAYLOAD, headers=headers)

    assert response.status_code == 504


def test_career_roadmap_invalid_json_response(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    with patch("routes.ai.OpenRouterClient") as MockClient:
        mock_instance = MockClient.return_value
        mock_instance.chat_completion.return_value = {"content": "Not JSON."}

        response = client.post("/api/ai/roadmap", json=ROADMAP_PAYLOAD, headers=headers)

    assert response.status_code == 200
    assert response.get_json()["data"]["aiEnhanced"] is False


def test_career_roadmap_missing_api_key(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    original_key = Config.OPENROUTER_API_KEY
    try:
        Config.OPENROUTER_API_KEY = None
        response = client.post("/api/ai/roadmap", json=ROADMAP_PAYLOAD, headers=headers)
        assert response.status_code == 500
    finally:
        Config.OPENROUTER_API_KEY = original_key


def test_career_roadmap_strips_markdown_code_fences(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    mock_response = _build_roadmap_mock_response()
    mock_response["content"] = "```json\n" + mock_response["content"] + "\n```"

    with patch("routes.ai.OpenRouterClient") as MockClient:
        mock_instance = MockClient.return_value
        mock_instance.chat_completion.return_value = mock_response

        response = client.post("/api/ai/roadmap", json=ROADMAP_PAYLOAD, headers=headers)

    assert response.status_code == 200
    body = response.get_json()
    assert body["success"] is True
    assert "roadmap" in body["data"]


# ---------------------------------------------------------------------------
# AI Skill Gap Analyzer tests
# ---------------------------------------------------------------------------

SKILL_GAP_PAYLOAD = {
    "student_name": "AI Test Student",
    "selected_career": "Data Scientist",
    "current_skills": ["Python", "Communication"],
    "technical_skills": ["Python", "SQL"],
    "soft_skills": ["Teamwork"],
    "projects": ["Sales dashboard"],
    "certifications": ["Google Data Analytics"],
    "education": "B.Tech in Computer Science",
    "experience": "1 year internship at a startup",
}


def _build_skill_gap_mock_response():
    return {
        "content": json.dumps({
            "skillGapAnalysis": {
                "requiredSkills": ["Python", "Machine Learning", "Statistics", "SQL", "Data Visualization"],
                "missingSkills": ["Machine Learning", "Statistics", "Deep Learning"],
                "skillGapPercentage": 60,
                "learningPriority": ["Machine Learning", "Statistics", "Deep Learning"],
                "recommendedTechnologies": ["TensorFlow", "PyTorch", "Scikit-learn", "Tableau"],
                "learningPath": ["Learn ML fundamentals", "Practice on Kaggle", "Build ML projects"],
                "courses": [{"name": "Machine Learning Specialization", "platform": "Coursera", "duration": "3 months"}],
                "certifications": [{"name": "AWS ML Specialty", "provider": "Amazon"}],
                "projects": [{"name": "Customer churn prediction", "difficulty": "Intermediate"}],
                "practicePlatforms": ["Kaggle", "LeetCode", "HackerRank"],
                "books": ["Hands-On Machine Learning with Scikit-Learn"],
                "interviewPreparation": ["ML concept revision", "Coding practice"],
                "estimatedCompletionTime": "6 months",
                "weeklyLearningPlan": ["Week 1: Linear regression", "Week 2: Classification models"],
                "monthlyLearningPlan": ["Month 1: Supervised learning", "Month 2: Unsupervised learning"],
                "expectedOutcome": "Able to build end-to-end ML models and clear technical interviews.",
            }
        })
    }


def test_skill_gap_success(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    with patch("routes.ai.OpenRouterClient") as MockClient:
        mock_instance = MockClient.return_value
        mock_instance.chat_completion.return_value = _build_skill_gap_mock_response()

        response = client.post("/api/ai/skill-gap", json=SKILL_GAP_PAYLOAD, headers=headers)

    assert response.status_code == 200
    body = response.get_json()
    assert body["success"] is True
    assert "skillGapAnalysis" in body["data"]
    assert body["data"]["skillGapAnalysis"]["skillGapPercentage"] == 60
    assert len(body["data"]["skillGapAnalysis"]["missingSkills"]) == 3


def test_skill_gap_requires_auth(client):
    response = client.post("/api/ai/skill-gap", json=SKILL_GAP_PAYLOAD)
    assert response.status_code == 401


def test_skill_gap_validation_errors(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    invalid_payloads = [
        ({}, "Missing required fields"),
        ({"student_name": "A", "selected_career": "Data Scientist", "education": "B.Tech", "current_skills": "not-a-list", "technical_skills": [], "soft_skills": [], "projects": [], "certifications": []}, "current_skills must be list"),
    ]

    for payload, description in invalid_payloads:
        response = client.post("/api/ai/skill-gap", json=payload, headers=headers)
        assert response.status_code == 422, f"Expected 422 for: {description}"


def test_skill_gap_openrouter_rate_limit(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    with patch("routes.ai.OpenRouterClient") as MockClient:
        from utils.openrouter import OpenRouterRateLimitError
        mock_instance = MockClient.return_value
        mock_instance.chat_completion.side_effect = OpenRouterRateLimitError("Rate limited.")

        response = client.post("/api/ai/skill-gap", json=SKILL_GAP_PAYLOAD, headers=headers)

    assert response.status_code == 429


def test_skill_gap_openrouter_timeout(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    with patch("routes.ai.OpenRouterClient") as MockClient:
        from utils.openrouter import OpenRouterTimeoutError
        mock_instance = MockClient.return_value
        mock_instance.chat_completion.side_effect = OpenRouterTimeoutError("Timed out.")

        response = client.post("/api/ai/skill-gap", json=SKILL_GAP_PAYLOAD, headers=headers)

    assert response.status_code == 504


def test_skill_gap_invalid_json_response(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    with patch("routes.ai.OpenRouterClient") as MockClient:
        mock_instance = MockClient.return_value
        mock_instance.chat_completion.return_value = {"content": "Not JSON."}

        response = client.post("/api/ai/skill-gap", json=SKILL_GAP_PAYLOAD, headers=headers)

    assert response.status_code == 500


def test_skill_gap_missing_api_key(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    original_key = Config.OPENROUTER_API_KEY
    try:
        Config.OPENROUTER_API_KEY = None
        response = client.post("/api/ai/skill-gap", json=SKILL_GAP_PAYLOAD, headers=headers)
        assert response.status_code == 500
    finally:
        Config.OPENROUTER_API_KEY = original_key


def test_skill_gap_strips_markdown_code_fences(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    mock_response = _build_skill_gap_mock_response()
    mock_response["content"] = "```json\n" + mock_response["content"] + "\n```"

    with patch("routes.ai.OpenRouterClient") as MockClient:
        mock_instance = MockClient.return_value
        mock_instance.chat_completion.return_value = mock_response

        response = client.post("/api/ai/skill-gap", json=SKILL_GAP_PAYLOAD, headers=headers)

    assert response.status_code == 200
    body = response.get_json()
    assert body["success"] is True
    assert "skillGapAnalysis" in body["data"]


# ---------------------------------------------------------------------------
# AI Career Chatbot tests
# ---------------------------------------------------------------------------

CHAT_PAYLOAD = {
    "message": "What skills should I learn to become a data scientist?",
    "student_profile": {
        "name": "AI Test Student",
        "class": "Class 12",
        "stream": "Science",
        "career_goal": "Data Scientist",
    },
}


def _build_chat_mock_response():
    return {
        "content": json.dumps({
            "response": "To become a data scientist, you should focus on learning Python, statistics, and machine learning. Start with Python programming, then move to data analysis with pandas and numpy.",
            "suggestedResources": ["Kaggle Learn", "Coursera ML Specialization", "Python for Everybody"],
            "nextSteps": ["Complete Python basics course", "Work on 2-3 data analysis projects", "Participate in Kaggle competitions"],
        })
    }


def test_career_chat_success(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    with patch("routes.ai.OpenRouterClient") as MockClient:
        mock_instance = MockClient.return_value
        mock_instance.chat_completion.return_value = _build_chat_mock_response()

        response = client.post("/api/ai/chat", json=CHAT_PAYLOAD, headers=headers)

    assert response.status_code == 200
    body = response.get_json()
    assert body["success"] is True
    assert "response" in body["data"]
    assert "data scientist" in body["data"]["response"].lower()
    assert isinstance(body["data"]["suggestedResources"], list)
    assert isinstance(body["data"]["nextSteps"], list)


def test_career_chat_requires_auth(client):
    response = client.post("/api/ai/chat", json=CHAT_PAYLOAD)
    assert response.status_code == 401


def test_career_chat_validation_errors(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    invalid_payloads = [
        ({}, "Missing message"),
        ({"message": ""}, "Empty message"),
        ({"message": "Hi", "student_profile": "not-an-object"}, "student_profile must be object"),
    ]

    for payload, description in invalid_payloads:
        response = client.post("/api/ai/chat", json=payload, headers=headers)
        assert response.status_code == 422, f"Expected 422 for: {description}"


def test_career_chat_openrouter_rate_limit(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    with patch("routes.ai.OpenRouterClient") as MockClient:
        from utils.openrouter import OpenRouterRateLimitError
        mock_instance = MockClient.return_value
        mock_instance.chat_completion.side_effect = OpenRouterRateLimitError("Rate limited.")

        response = client.post("/api/ai/chat", json=CHAT_PAYLOAD, headers=headers)

    assert response.status_code == 429


def test_career_chat_openrouter_timeout(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    with patch("routes.ai.OpenRouterClient") as MockClient:
        from utils.openrouter import OpenRouterTimeoutError
        mock_instance = MockClient.return_value
        mock_instance.chat_completion.side_effect = OpenRouterTimeoutError("Timed out.")

        response = client.post("/api/ai/chat", json=CHAT_PAYLOAD, headers=headers)

    assert response.status_code == 504


def test_career_chat_invalid_json_response(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    with patch("routes.ai.OpenRouterClient") as MockClient:
        mock_instance = MockClient.return_value
        mock_instance.chat_completion.return_value = {"content": "Not JSON."}

        response = client.post("/api/ai/chat", json=CHAT_PAYLOAD, headers=headers)

    assert response.status_code == 500


def test_career_chat_missing_api_key(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    original_key = Config.OPENROUTER_API_KEY
    try:
        Config.OPENROUTER_API_KEY = None
        response = client.post("/api/ai/chat", json=CHAT_PAYLOAD, headers=headers)
        assert response.status_code == 500
    finally:
        Config.OPENROUTER_API_KEY = original_key


def test_career_chat_strips_markdown_code_fences(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    mock_response = _build_chat_mock_response()
    mock_response["content"] = "```json\n" + mock_response["content"] + "\n```"

    with patch("routes.ai.OpenRouterClient") as MockClient:
        mock_instance = MockClient.return_value
        mock_instance.chat_completion.return_value = mock_response

        response = client.post("/api/ai/chat", json=CHAT_PAYLOAD, headers=headers)

    assert response.status_code == 200
    body = response.get_json()
    assert body["success"] is True
    assert "response" in body["data"]


# ---------------------------------------------------------------------------
# AI Resume Analyzer tests
# ---------------------------------------------------------------------------

RESUME_PAYLOAD = {
    "student_name": "AI Test Student",
    "career_goal": "Software Engineer",
    "resume_text": "Experienced developer with skills in Python and JavaScript. Built several web applications.",
    "skills": ["Python", "JavaScript", "React"],
    "projects": ["E-commerce website", "Task manager app"],
    "certifications": ["AWS Certified Developer"],
    "education": "B.Tech in Computer Science",
    "internships": ["Software intern at TechCorp"],
}


def _build_resume_mock_response():
    return {
        "content": json.dumps({
            "resumeAnalysis": {
                "resumeScore": 75,
                "strengths": ["Clear project descriptions", "Relevant technical skills"],
                "weaknesses": ["Missing quantifiable achievements", "No keywords for ATS"],
                "missingSections": ["Leadership experience", "Volunteer work"],
                "missingSkills": ["Docker", "Kubernetes", "CI/CD"],
                "atsImprovementSuggestions": ["Add more industry keywords", "Use standard section headings"],
                "betterProjectDescriptions": ["Led a team of 4 to build an e-commerce platform serving 1000+ users"],
                "betterSummary": "Results-driven software engineer with 2+ years of experience in full-stack development...",
                "betterSkillsSection": "Languages: Python, JavaScript | Frameworks: React, Node.js | Tools: Git, Docker",
                "recommendedCertifications": ["Docker Certified Associate", "Kubernetes Administrator"],
                "resumeImprovementPlan": ["Add metrics to project descriptions", "Include AWS and DevOps keywords", "Format with consistent bullet points"],
            }
        })
    }


def test_resume_analyzer_success(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    with patch("routes.ai.OpenRouterClient") as MockClient:
        mock_instance = MockClient.return_value
        mock_instance.chat_completion.return_value = _build_resume_mock_response()

        response = client.post("/api/ai/resume-analyzer", json=RESUME_PAYLOAD, headers=headers)

    assert response.status_code == 200
    body = response.get_json()
    assert body["success"] is True
    assert "resumeAnalysis" in body["data"]
    assert body["data"]["resumeAnalysis"]["resumeScore"] == 75
    assert len(body["data"]["resumeAnalysis"]["strengths"]) == 2


def test_resume_analyzer_requires_auth(client):
    response = client.post("/api/ai/resume-analyzer", json=RESUME_PAYLOAD)
    assert response.status_code == 401


def test_resume_analyzer_validation_errors(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    invalid_payloads = [
        ({}, "Missing required fields"),
        ({"student_name": "A", "career_goal": "Engineer", "resume_text": "Short", "skills": "not-a-list", "projects": [], "certifications": [], "education": "B.Tech", "internships": []}, "skills must be list"),
        ({"student_name": "A", "career_goal": "Engineer", "resume_text": "A" * 10, "skills": ["Python"], "projects": [], "certifications": [], "education": "B.Tech", "internships": []}, "resume_text too short"),
    ]

    for payload, description in invalid_payloads:
        response = client.post("/api/ai/resume-analyzer", json=payload, headers=headers)
        assert response.status_code == 422, f"Expected 422 for: {description}"


def test_resume_analyzer_openrouter_rate_limit(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    with patch("routes.ai.OpenRouterClient") as MockClient:
        from utils.openrouter import OpenRouterRateLimitError
        mock_instance = MockClient.return_value
        mock_instance.chat_completion.side_effect = OpenRouterRateLimitError("Rate limited.")

        response = client.post("/api/ai/resume-analyzer", json=RESUME_PAYLOAD, headers=headers)

    assert response.status_code == 429


def test_resume_analyzer_openrouter_timeout(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    with patch("routes.ai.OpenRouterClient") as MockClient:
        from utils.openrouter import OpenRouterTimeoutError
        mock_instance = MockClient.return_value
        mock_instance.chat_completion.side_effect = OpenRouterTimeoutError("Timed out.")

        response = client.post("/api/ai/resume-analyzer", json=RESUME_PAYLOAD, headers=headers)

    assert response.status_code == 504


def test_resume_analyzer_invalid_json_response(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    with patch("routes.ai.OpenRouterClient") as MockClient:
        mock_instance = MockClient.return_value
        mock_instance.chat_completion.return_value = {"content": "Not JSON."}

        response = client.post("/api/ai/resume-analyzer", json=RESUME_PAYLOAD, headers=headers)

    assert response.status_code == 500


def test_resume_analyzer_missing_api_key(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    original_key = Config.OPENROUTER_API_KEY
    try:
        Config.OPENROUTER_API_KEY = None
        response = client.post("/api/ai/resume-analyzer", json=RESUME_PAYLOAD, headers=headers)
        assert response.status_code == 500
    finally:
        Config.OPENROUTER_API_KEY = original_key


def test_resume_analyzer_strips_markdown_code_fences(client):
    token = _register_and_login(client)
    headers = _auth_headers(token)

    mock_response = _build_resume_mock_response()
    mock_response["content"] = "```json\n" + mock_response["content"] + "\n```"

    with patch("routes.ai.OpenRouterClient") as MockClient:
        mock_instance = MockClient.return_value
        mock_instance.chat_completion.return_value = mock_response

        response = client.post("/api/ai/resume-analyzer", json=RESUME_PAYLOAD, headers=headers)

    assert response.status_code == 200
    body = response.get_json()
    assert body["success"] is True
    assert "resumeAnalysis" in body["data"]
