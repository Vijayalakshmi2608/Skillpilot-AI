"""AI-powered career recommendation endpoints."""
import json
import logging
import re
from typing import Any, Dict, List, Optional

from flask import Blueprint, request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required
from sqlalchemy.exc import SQLAlchemyError

from config import Config
from models import StudentProfile, User, db
from routes import ok, json_body
from utils.openrouter import OpenRouterClient, OpenRouterError, OpenRouterRateLimitError, OpenRouterTimeoutError
from utils.responses import error_response, not_found_response, server_error_response
from utils.validators import validate_string, validate_integer

ai_bp = Blueprint("ai", __name__, url_prefix="/api/ai")

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """\
You are a Senior Career Guidance Expert with deep experience in career counselling, \
education planning, labour market analysis, and higher education. Your sole purpose is \
to provide accurate, data-driven, and personalised career recommendations.

Analyse the student's profile holistically across these dimensions:
- Academic Performance (marks, class, stream)
- Student Interests
- Skills
- Learning Style (inferred from favourite subjects and study type preference)
- Personality
- Career Goal
- Budget
- Preferred Location
- Future Job Trends
- Industry Demand

For each recommended career, provide a structured analysis with the following fields:
- careerName
- whyThisCareerMatches
- matchScore (integer 0-100)
- requiredDegree
- requiredSkills (list)
- salaryRange
- futureDemand
- advantages (list)
- challenges (list)
- requiredCertifications (list)
- suggestedProjects (list)
- internships (list)
- higherStudies (list)
- topCompanies (list)
- roadmapSummary

Return ONLY a valid JSON object. Do not include markdown, code fences, or explanatory text outside the JSON."""

USER_PROMPT_TEMPLATE = """\
Student Profile:
- Name: {name}
- Class: {student_class}
- Stream: {stream}
- Marks: {marks}
- Skills: {skills}
- Interests: {interests}
- Personality: {personality}
- Favourite Subjects: {favourite_subjects}
- Career Goal: {career_goal}
- Budget: {budget}
- Preferred Location: {preferred_location}
- Preferred Study Type: {preferred_study_type}

Provide exactly 5 career recommendations in the specified JSON structure."""

EXPECTED_KEYS_PER_CAREER = {
    "careerName", "whyThisCareerMatches", "matchScore", "requiredDegree",
    "requiredSkills", "salaryRange", "futureDemand", "advantages", "challenges",
    "requiredCertifications", "suggestedProjects", "internships", "higherStudies",
    "topCompanies", "roadmapSummary",
}


def _current_student() -> Optional[User]:
    try:
        user = db.session.get(User, int(get_jwt_identity()))
    except (TypeError, ValueError):
        return None
    return user if user and user.role == "student" else None


def _validate_career_payload(data: Dict[str, Any]) -> Optional[Dict[str, str]]:
    errors: Dict[str, str] = {}
    if message := validate_string(data.get("name"), "Name", 2, 120):
        errors["name"] = message
    if message := validate_string(data.get("class"), "Class", 1, 50):
        errors["class"] = message
    if message := validate_string(data.get("stream"), "Stream", 1, 100):
        errors["stream"] = message
    if "marks" in data:
        marks = data.get("marks")
        if not isinstance(marks, (int, float)) or not (0 <= float(marks) <= 100):
            errors["marks"] = "Marks must be a number between 0 and 100."
    if message := validate_string(data.get("personality"), "Personality", 1, 500):
        errors["personality"] = message
    if message := validate_string(data.get("careerGoal"), "Career Goal", 1, 500):
        errors["careerGoal"] = message
    if message := validate_string(data.get("preferredLocation"), "Preferred Location", 1, 200):
        errors["preferredLocation"] = message
    if message := validate_string(data.get("preferredStudyType"), "Preferred Study Type", 1, 200):
        errors["preferredStudyType"] = message
    if message := validate_string(data.get("budget"), "Budget", 1, 100):
        errors["budget"] = message
    for field in ("skills", "interests", "favouriteSubjects"):
        value = data.get(field)
        if not isinstance(value, list) or not all(isinstance(item, str) for item in value):
            errors[field] = "Must be a list of strings."
    return errors or None


def _build_prompt(data: Dict[str, Any]) -> str:
    return USER_PROMPT_TEMPLATE.format(
        name=data.get("name", "Student"),
        student_class=data.get("class", "Unknown"),
        stream=data.get("stream", "Unknown"),
        marks=data.get("marks", "Not provided"),
        skills=", ".join(data.get("skills", [])) or "Not provided",
        interests=", ".join(data.get("interests", [])) or "Not provided",
        personality=data.get("personality", "Not provided"),
        favourite_subjects=", ".join(data.get("favouriteSubjects", [])) or "Not provided",
        career_goal=data.get("careerGoal", "Not provided"),
        budget=data.get("budget", "Not provided"),
        preferred_location=data.get("preferredLocation", "Not provided"),
        preferred_study_type=data.get("preferredStudyType", "Not provided"),
    )


def _sanitize_json_string(raw: str) -> str:
    """Strip markdown code fences and surrounding whitespace from AI output."""
    stripped = raw.strip()
    if stripped.startswith("```"):
        stripped = re.sub(r"^```(?:json)?\s*", "", stripped)
        stripped = re.sub(r"\s*```$", "", stripped)
    return stripped.strip()


def _validate_response_structure(data: Any) -> List[str]:
    """Return a list of validation errors for the parsed AI response."""
    if not isinstance(data, dict):
        return ["Response must be a JSON object."]
    if "recommendations" not in data:
        return ["Response is missing 'recommendations' array."]
    recs = data.get("recommendations")
    if not isinstance(recs, list) or len(recs) != 5:
        return ["'recommendations' must be an array of exactly 5 items."]
    errors = []
    for idx, rec in enumerate(recs):
        if not isinstance(rec, dict):
            errors.append(f"Recommendation {idx + 1} is not an object.")
            continue
        missing = EXPECTED_KEYS_PER_CAREER - set(rec.keys())
        if missing:
            errors.append(f"Recommendation {idx + 1} is missing fields: {', '.join(sorted(missing))}.")
        if not isinstance(rec.get("matchScore"), (int, float)) or not (0 <= float(rec.get("matchScore", -1)) <= 100):
            errors.append(f"Recommendation {idx + 1} has an invalid matchScore (must be 0-100).")
        if not isinstance(rec.get("requiredSkills"), list):
            errors.append(f"Recommendation {idx + 1} requiredSkills must be a list.")
        if not isinstance(rec.get("advantages"), list):
            errors.append(f"Recommendation {idx + 1} advantages must be a list.")
        if not isinstance(rec.get("challenges"), list):
            errors.append(f"Recommendation {idx + 1} challenges must be a list.")
        if not isinstance(rec.get("requiredCertifications"), list):
            errors.append(f"Recommendation {idx + 1} requiredCertifications must be a list.")
        if not isinstance(rec.get("suggestedProjects"), list):
            errors.append(f"Recommendation {idx + 1} suggestedProjects must be a list.")
        if not isinstance(rec.get("internships"), list):
            errors.append(f"Recommendation {idx + 1} internships must be a list.")
        if not isinstance(rec.get("higherStudies"), list):
            errors.append(f"Recommendation {idx + 1} higherStudies must be a list.")
        if not isinstance(rec.get("topCompanies"), list):
            errors.append(f"Recommendation {idx + 1} topCompanies must be a list.")
    return errors


@ai_bp.post("/career-recommendation")
@jwt_required()
def career_recommendation():
    user = _current_student()
    if not user:
        return not_found_response("Student account not found.")

    data, error = json_body()
    if error:
        return error

    validation_errors = _validate_career_payload(data)
    if validation_errors:
        return error_response("Validation failed.", 422, validation_errors)

    if not Config.OPENROUTER_API_KEY:
        logger.error("OpenRouter API key is not configured.")
        return server_error_response("AI service is not configured.")

    prompt = _build_prompt(data)
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": prompt},
    ]

    try:
        client = OpenRouterClient(
            api_key=Config.OPENROUTER_API_KEY,
            api_url=Config.OPENROUTER_API_URL,
            model=Config.OPENROUTER_MODEL,
            timeout=Config.OPENROUTER_TIMEOUT,
            max_retries=Config.OPENROUTER_MAX_RETRIES,
        )
        result = client.chat_completion(messages=messages, temperature=0.7, max_tokens=4096)
        raw_content = result["content"]
    except OpenRouterRateLimitError as exc:
        logger.warning("OpenRouter rate limit hit for user %s: %s", user.id, exc)
        return error_response("AI service is temporarily rate-limited. Please try again later.", 429)
    except OpenRouterTimeoutError as exc:
        logger.warning("OpenRouter timeout for user %s: %s", user.id, exc)
        return error_response("AI service timed out. Please try again later.", 504)
    except OpenRouterError as exc:
        logger.error("OpenRouter error for user %s: %s", user.id, exc)
        return server_error_response("AI service is currently unavailable.")
    except Exception as exc:
        logger.exception("Unexpected error calling OpenRouter for user %s.", user.id)
        return server_error_response("AI service is currently unavailable.")

    cleaned = _sanitize_json_string(raw_content)
    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        logger.error("OpenRouter returned non-JSON content for user %s. Raw: %s", user.id, raw_content[:500])
        return server_error_response("AI service returned an invalid response.")

    structure_errors = _validate_response_structure(parsed)
    if structure_errors:
        logger.error("OpenRouter response structure invalid for user %s: %s. Raw: %s", user.id, structure_errors, raw_content[:500])
        return server_error_response("AI service returned an incompatible response structure.")

    return ok({"recommendations": parsed["recommendations"]}, "Career recommendations generated successfully.")


# ---------------------------------------------------------------------------
# AI Career Roadmap
# ---------------------------------------------------------------------------

ROADMAP_SYSTEM_PROMPT = """\
You are a Professional Career Planning Expert with deep expertise in education pathways, \
entrance exams, skill development, internships, higher studies, and job market trends.

Generate a complete, personalised career roadmap from Class 12 to the target career.

The roadmap MUST include these sections:
- entranceExams (list of exams with names, eligibility, and preparation tips)
- degreeSelection (recommended degrees with reasons)
- semesterWiseLearning (list of semester-wise subjects/skills to focus on)
- certifications (list of certifications with timeline)
- projects (list of projects with difficulty level)
- internships (list of internships with companies/types)
- hackathons (list of recommended hackathons/competitions)
- portfolio (list of portfolio items to build)
- resumePreparation (steps to build a strong resume)
- placementPreparation (placement readiness steps)
- interviewPreparation (interview prep plan)
- higherStudies (optional higher studies options)
- estimatedTimeline (total years/months from start to goal)
- monthlyGoals (list of 12 monthly goals)
- yearlyGoals (list of 3-5 yearly goals)
- freeResources (list of free online resources/books/platforms)
- paidResources (list of paid courses/certifications/platforms)
- tips (list of practical tips for success)

Return ONLY a valid JSON object with a top-level "roadmap" key containing all these fields. \
Do not include markdown, code fences, or explanatory text outside the JSON."""

ROADMAP_USER_PROMPT_TEMPLATE = """\
Student Profile:
- Name: {name}
- Selected Career: {selected_career}
- Current Skills: {current_skills}
- Current Education: {current_education}
- Budget: {budget}
- Location: {location}
- Career Goal: {career_goal}

Generate a comprehensive career roadmap from Class 12 to achieving the career goal."""


def _validate_roadmap_payload(data: Dict[str, Any]) -> Optional[Dict[str, str]]:
    errors: Dict[str, str] = {}
    if message := validate_string(data.get("name"), "Name", 2, 120):
        errors["name"] = message
    if message := validate_string(data.get("selectedCareer"), "Selected Career", 2, 150):
        errors["selectedCareer"] = message
    if message := validate_string(data.get("currentEducation"), "Current Education", 1, 200):
        errors["currentEducation"] = message
    if message := validate_string(data.get("careerGoal"), "Career Goal", 1, 500):
        errors["careerGoal"] = message
    if message := validate_string(data.get("budget"), "Budget", 1, 100):
        errors["budget"] = message
    if message := validate_string(data.get("location"), "Location", 1, 200):
        errors["location"] = message
    for field in ("currentSkills",):
        value = data.get(field)
        if not isinstance(value, list) or not all(isinstance(item, str) for item in value):
            errors[field] = "Must be a list of strings."
    return errors or None


def _build_roadmap_prompt(data: Dict[str, Any]) -> str:
    return ROADMAP_USER_PROMPT_TEMPLATE.format(
        name=data.get("name", "Student"),
        selected_career=data.get("selectedCareer", "Unknown"),
        current_skills=", ".join(data.get("currentSkills", [])) or "Not provided",
        current_education=data.get("currentEducation", "Not provided"),
        budget=data.get("budget", "Not provided"),
        location=data.get("location", "Not provided"),
        career_goal=data.get("careerGoal", "Not provided"),
    )


def _validate_roadmap_structure(data: Any) -> List[str]:
    required_keys = {
        "entranceExams", "degreeSelection", "semesterWiseLearning", "certifications",
        "projects", "internships", "hackathons", "portfolio", "resumePreparation",
        "placementPreparation", "interviewPreparation", "higherStudies", "estimatedTimeline",
        "monthlyGoals", "yearlyGoals", "freeResources", "paidResources", "tips",
    }
    if not isinstance(data, dict):
        return ["Roadmap response must be a JSON object."]
    if "roadmap" not in data:
        return ["Response is missing 'roadmap' object."]
    roadmap = data.get("roadmap")
    if not isinstance(roadmap, dict):
        return ["'roadmap' must be an object."]
    missing = required_keys - set(roadmap.keys())
    if missing:
        return [f"Roadmap is missing fields: {', '.join(sorted(missing))}."]
    return []


@ai_bp.post("/roadmap")
@jwt_required()
def career_roadmap():
    user = _current_student()
    if not user:
        return not_found_response("Student account not found.")

    data, error = json_body()
    if error:
        return error

    validation_errors = _validate_roadmap_payload(data)
    if validation_errors:
        return error_response("Validation failed.", 422, validation_errors)

    if not Config.OPENROUTER_API_KEY:
        logger.error("OpenRouter API key is not configured.")
        return server_error_response("AI service is not configured.")

    prompt = _build_roadmap_prompt(data)
    messages = [
        {"role": "system", "content": ROADMAP_SYSTEM_PROMPT},
        {"role": "user", "content": prompt},
    ]

    try:
        client = OpenRouterClient(
            api_key=Config.OPENROUTER_API_KEY,
            api_url=Config.OPENROUTER_API_URL,
            model=Config.OPENROUTER_MODEL,
            timeout=Config.OPENROUTER_TIMEOUT,
            max_retries=Config.OPENROUTER_MAX_RETRIES,
        )
        result = client.chat_completion(messages=messages, temperature=0.7, max_tokens=4096)
        raw_content = result["content"]
    except OpenRouterRateLimitError as exc:
        logger.warning("OpenRouter rate limit hit for user %s: %s", user.id, exc)
        return error_response("AI service is temporarily rate-limited. Please try again later.", 429)
    except OpenRouterTimeoutError as exc:
        logger.warning("OpenRouter timeout for user %s: %s", user.id, exc)
        return error_response("AI service timed out. Please try again later.", 504)
    except OpenRouterError as exc:
        logger.error("OpenRouter error for user %s: %s", user.id, exc)
        return server_error_response("AI service is currently unavailable.")
    except Exception as exc:
        logger.exception("Unexpected error calling OpenRouter for user %s.", user.id)
        return server_error_response("AI service is currently unavailable.")

    cleaned = _sanitize_json_string(raw_content)
    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        logger.error("OpenRouter returned non-JSON content for user %s. Raw: %s", user.id, raw_content[:500])
        return server_error_response("AI service returned an invalid response.")

    structure_errors = _validate_roadmap_structure(parsed)
    if structure_errors:
        logger.error("OpenRouter response structure invalid for user %s: %s. Raw: %s", user.id, structure_errors, raw_content[:500])
        return server_error_response("AI service returned an incompatible response structure.")

    return ok({"roadmap": parsed["roadmap"]}, "Career roadmap generated successfully.")


# ---------------------------------------------------------------------------
# AI Skill Gap Analyzer
# ---------------------------------------------------------------------------

SKILL_GAP_SYSTEM_PROMPT = """\
You are an Industry Skill Assessment Expert with deep knowledge of current job market requirements, \
technical stacks, and professional standards across multiple domains.

Analyse the student's current skills against industry standards for their selected career.

Generate a structured analysis with these fields:
- requiredSkills (list of skills required for the selected career)
- missingSkills (list of skills the student currently lacks)
- skillGapPercentage (integer 0-100 representing how much of the required skillset is missing)
- learningPriority (list of skills ordered by priority to learn first)
- recommendedTechnologies (list of specific technologies/tools to learn)
- learningPath (step-by-step learning sequence)
- courses (list of recommended courses with platform and duration)
- certifications (list of certifications to pursue)
- projects (list of projects to build to close the gap)
- practicePlatforms (list of platforms for hands-on practice like LeetCode, HackerRank, etc.)
- books (list of recommended books)
- interviewPreparation (interview prep strategy)
- estimatedCompletionTime (estimated time to close the skill gap)
- weeklyLearningPlan (list of 4 weekly goals)
- monthlyLearningPlan (list of 3 monthly goals)
- expectedOutcome (what the student will achieve after completing the plan)

Return ONLY a valid JSON object with a top-level "skillGapAnalysis" key containing all these fields. \
Do not include markdown, code fences, or explanatory text outside the JSON."""

SKILL_GAP_USER_PROMPT_TEMPLATE = """\
Student Profile:
- Name: {student_name}
- Selected Career: {selected_career}
- Current Skills: {current_skills}
- Technical Skills: {technical_skills}
- Soft Skills: {soft_skills}
- Projects: {projects}
- Certifications: {certifications}
- Education: {education}
- Experience: {experience}

Analyse the skill gap between the student's current profile and industry requirements for the selected career."""


def _validate_skill_gap_payload(data: Dict[str, Any]) -> Optional[Dict[str, str]]:
    errors: Dict[str, str] = {}
    if message := validate_string(data.get("student_name"), "Student Name", 2, 120):
        errors["student_name"] = message
    if message := validate_string(data.get("selected_career"), "Selected Career", 2, 150):
        errors["selected_career"] = message
    if message := validate_string(data.get("education"), "Education", 1, 200):
        errors["education"] = message
    if message := validate_string(data.get("experience"), "Experience", 0, 500):
        errors["experience"] = message
    for field in ("current_skills", "technical_skills", "soft_skills", "projects", "certifications"):
        value = data.get(field)
        if not isinstance(value, list) or not all(isinstance(item, str) for item in value):
            errors[field] = "Must be a list of strings."
    return errors or None


def _build_skill_gap_prompt(data: Dict[str, Any]) -> str:
    return SKILL_GAP_USER_PROMPT_TEMPLATE.format(
        student_name=data.get("student_name", "Student"),
        selected_career=data.get("selected_career", "Unknown"),
        current_skills=", ".join(data.get("current_skills", [])) or "Not provided",
        technical_skills=", ".join(data.get("technical_skills", [])) or "Not provided",
        soft_skills=", ".join(data.get("soft_skills", [])) or "Not provided",
        projects=", ".join(data.get("projects", [])) or "Not provided",
        certifications=", ".join(data.get("certifications", [])) or "Not provided",
        education=data.get("education", "Not provided"),
        experience=data.get("experience", "Not provided"),
    )


def _validate_skill_gap_structure(data: Any) -> List[str]:
    required_keys = {
        "requiredSkills", "missingSkills", "skillGapPercentage", "learningPriority",
        "recommendedTechnologies", "learningPath", "courses", "certifications",
        "projects", "practicePlatforms", "books", "interviewPreparation",
        "estimatedCompletionTime", "weeklyLearningPlan", "monthlyLearningPlan", "expectedOutcome",
    }
    if not isinstance(data, dict):
        return ["Skill gap response must be a JSON object."]
    if "skillGapAnalysis" not in data:
        return ["Response is missing 'skillGapAnalysis' object."]
    analysis = data.get("skillGapAnalysis")
    if not isinstance(analysis, dict):
        return ["'skillGapAnalysis' must be an object."]
    missing = required_keys - set(analysis.keys())
    if missing:
        return [f"Skill gap analysis is missing fields: {', '.join(sorted(missing))}."]
    if not isinstance(analysis.get("skillGapPercentage"), (int, float)) or not (0 <= float(analysis.get("skillGapPercentage", -1)) <= 100):
        return ["skillGapPercentage must be a number between 0 and 100."]
    return []


@ai_bp.post("/skill-gap")
@jwt_required()
def skill_gap_analyzer():
    user = _current_student()
    if not user:
        return not_found_response("Student account not found.")

    data, error = json_body()
    if error:
        return error

    validation_errors = _validate_skill_gap_payload(data)
    if validation_errors:
        return error_response("Validation failed.", 422, validation_errors)

    if not Config.OPENROUTER_API_KEY:
        logger.error("OpenRouter API key is not configured.")
        return server_error_response("AI service is not configured.")

    prompt = _build_skill_gap_prompt(data)
    messages = [
        {"role": "system", "content": SKILL_GAP_SYSTEM_PROMPT},
        {"role": "user", "content": prompt},
    ]

    try:
        client = OpenRouterClient(
            api_key=Config.OPENROUTER_API_KEY,
            api_url=Config.OPENROUTER_API_URL,
            model=Config.OPENROUTER_MODEL,
            timeout=Config.OPENROUTER_TIMEOUT,
            max_retries=Config.OPENROUTER_MAX_RETRIES,
        )
        result = client.chat_completion(messages=messages, temperature=0.7, max_tokens=4096)
        raw_content = result["content"]
    except OpenRouterRateLimitError as exc:
        logger.warning("OpenRouter rate limit hit for user %s: %s", user.id, exc)
        return error_response("AI service is temporarily rate-limited. Please try again later.", 429)
    except OpenRouterTimeoutError as exc:
        logger.warning("OpenRouter timeout for user %s: %s", user.id, exc)
        return error_response("AI service timed out. Please try again later.", 504)
    except OpenRouterError as exc:
        logger.error("OpenRouter error for user %s: %s", user.id, exc)
        return server_error_response("AI service is currently unavailable.")
    except Exception as exc:
        logger.exception("Unexpected error calling OpenRouter for user %s.", user.id)
        return server_error_response("AI service is currently unavailable.")

    cleaned = _sanitize_json_string(raw_content)
    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        logger.error("OpenRouter returned non-JSON content for user %s. Raw: %s", user.id, raw_content[:500])
        return server_error_response("AI service returned an invalid response.")

    structure_errors = _validate_skill_gap_structure(parsed)
    if structure_errors:
        logger.error("OpenRouter response structure invalid for user %s: %s. Raw: %s", user.id, structure_errors, raw_content[:500])
        return server_error_response("AI service returned an incompatible response structure.")

    return ok({"skillGapAnalysis": parsed["skillGapAnalysis"]}, "Skill gap analysis generated successfully.")


# ---------------------------------------------------------------------------
# AI Career Chatbot
# ---------------------------------------------------------------------------

CHAT_SYSTEM_PROMPT = """\
You are an experienced Career Counselor with deep knowledge across multiple domains including \
Career Guidance, College Selection, Higher Studies, Government Jobs, Private Jobs, Abroad Studies, \
Scholarships, Programming, Engineering, Medical, Commerce, Arts, Interview Tips, Resume Building, \
Placement, Startups, Freelancing, Skills Development, Future Scope, Salary, and Industry Trends.

Rules:
1. Answer politely and keep answers simple and easy to understand.
2. Provide examples wherever possible.
3. Suggest resources (books, courses, platforms) when relevant.
4. Suggest clear next steps.
5. If you are uncertain about any fact, clearly say so rather than inventing facts.
6. Keep responses concise but comprehensive.

Return ONLY a valid JSON object with these fields:
- response (string: your main answer)
- suggestedResources (list of strings: resources mentioned)
- nextSteps (list of strings: actionable next steps)

Do not include markdown, code fences, or explanatory text outside the JSON."""

CHAT_USER_PROMPT_TEMPLATE = """\
Student Profile:
{student_profile}

Student Question: {message}

Answer the student's question based on their profile and your expertise."""


def _validate_chat_payload(data: Dict[str, Any]) -> Optional[Dict[str, str]]:
    errors: Dict[str, str] = {}
    if message := validate_string(data.get("message"), "Message", 1, 2000):
        errors["message"] = message
    if "student_profile" in data:
        profile = data.get("student_profile")
        if not isinstance(profile, dict):
            errors["student_profile"] = "Must be a JSON object."
    return errors or None


def _build_chat_prompt(data: Dict[str, Any]) -> str:
    profile = data.get("student_profile", {})
    profile_lines = []
    if profile:
        for key, value in profile.items():
            if isinstance(value, list):
                value = ", ".join(str(v) for v in value)
            profile_lines.append(f"- {key.replace('_', ' ').title()}: {value}")
    profile_str = "\n".join(profile_lines) if profile_lines else "No profile provided."
    return CHAT_USER_PROMPT_TEMPLATE.format(
        student_profile=profile_str,
        message=data.get("message", ""),
    )


def _validate_chat_structure(data: Any) -> List[str]:
    if not isinstance(data, dict):
        return ["Chat response must be a JSON object."]
    if "response" not in data:
        return ["Response is missing 'response' string."]
    if not isinstance(data.get("response"), str):
        return ["'response' must be a string."]
    if "suggestedResources" in data and not isinstance(data.get("suggestedResources"), list):
        return ["'suggestedResources' must be a list."]
    if "nextSteps" in data and not isinstance(data.get("nextSteps"), list):
        return ["'nextSteps' must be a list."]
    return []


@ai_bp.post("/chat")
@jwt_required()
def career_chat():
    user = _current_student()
    if not user:
        return not_found_response("Student account not found.")

    data, error = json_body()
    if error:
        return error

    validation_errors = _validate_chat_payload(data)
    if validation_errors:
        return error_response("Validation failed.", 422, validation_errors)

    if not Config.OPENROUTER_API_KEY:
        logger.error("OpenRouter API key is not configured.")
        return server_error_response("AI service is not configured.")

    prompt = _build_chat_prompt(data)
    messages = [
        {"role": "system", "content": CHAT_SYSTEM_PROMPT},
        {"role": "user", "content": prompt},
    ]

    try:
        client = OpenRouterClient(
            api_key=Config.OPENROUTER_API_KEY,
            api_url=Config.OPENROUTER_API_URL,
            model=Config.OPENROUTER_MODEL,
            timeout=Config.OPENROUTER_TIMEOUT,
            max_retries=Config.OPENROUTER_MAX_RETRIES,
        )
        result = client.chat_completion(messages=messages, temperature=0.8, max_tokens=2048)
        raw_content = result["content"]
    except OpenRouterRateLimitError as exc:
        logger.warning("OpenRouter rate limit hit for user %s: %s", user.id, exc)
        return error_response("AI service is temporarily rate-limited. Please try again later.", 429)
    except OpenRouterTimeoutError as exc:
        logger.warning("OpenRouter timeout for user %s: %s", user.id, exc)
        return error_response("AI service timed out. Please try again later.", 504)
    except OpenRouterError as exc:
        logger.error("OpenRouter error for user %s: %s", user.id, exc)
        return server_error_response("AI service is currently unavailable.")
    except Exception as exc:
        logger.exception("Unexpected error calling OpenRouter for user %s.", user.id)
        return server_error_response("AI service is currently unavailable.")

    cleaned = _sanitize_json_string(raw_content)
    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        logger.error("OpenRouter returned non-JSON content for user %s. Raw: %s", user.id, raw_content[:500])
        return server_error_response("AI service returned an invalid response.")

    structure_errors = _validate_chat_structure(parsed)
    if structure_errors:
        logger.error("OpenRouter response structure invalid for user %s: %s. Raw: %s", user.id, structure_errors, raw_content[:500])
        return server_error_response("AI service returned an incompatible response structure.")

    return ok(parsed, "Chat response generated successfully.")


# ---------------------------------------------------------------------------
# AI Resume Analyzer
# ---------------------------------------------------------------------------

RESUME_ANALYZER_SYSTEM_PROMPT = """\
You are a Senior Technical Recruiter and Resume Review Expert with 15+ years of experience \
in reviewing resumes for top tech companies. You are an expert in ATS (Applicant Tracking Systems) \
compatibility, resume formatting, and technical skill assessment.

Analyse the provided resume and student profile holistically across these dimensions:
- Resume Structure (formatting, sections, layout)
- Grammar and Professionalism
- ATS Compatibility (keyword optimization, formatting for ATS)
- Technical Skills (relevance, depth, presentation)
- Soft Skills (communication, leadership, teamwork indicators)
- Missing Skills (skills required for the target role but absent)
- Missing Keywords (industry-standard keywords missing)
- Projects (quality, description, impact)
- Internship Experience (relevance, description)
- Certifications (value, relevance)
- Resume Length (appropriate length for experience level)
- Formatting (consistency, readability, visual appeal)
- Overall Readability

Generate a structured analysis with these fields:
- resumeScore (integer 0-100)
- strengths (list of strings)
- weaknesses (list of strings)
- missingSections (list of strings)
- missingSkills (list of strings)
- atsImprovementSuggestions (list of strings)
- betterProjectDescriptions (list of strings with improved descriptions for existing projects)
- betterSummary (string: an improved professional summary)
- betterSkillsSection (string: improved skills section format/content)
- recommendedCertifications (list of strings)
- resumeImprovementPlan (list of strings: step-by-step improvement plan)

Return ONLY a valid JSON object with a top-level "resumeAnalysis" key containing all these fields. \
Do not include markdown, code fences, or explanatory text outside the JSON."""

RESUME_ANALYZER_USER_PROMPT_TEMPLATE = """\
Student Profile:
- Name: {student_name}
- Career Goal: {career_goal}
- Education: {education}
- Skills: {skills}
- Projects: {projects}
- Certifications: {certifications}
- Internships: {internships}

Resume Text:
{resume_text}

Analyse the resume and provide professional feedback and improvement suggestions."""


def _validate_resume_payload(data: Dict[str, Any]) -> Optional[Dict[str, str]]:
    errors: Dict[str, str] = {}
    if message := validate_string(data.get("student_name"), "Student Name", 2, 120):
        errors["student_name"] = message
    if message := validate_string(data.get("career_goal"), "Career Goal", 2, 500):
        errors["career_goal"] = message
    if message := validate_string(data.get("resume_text"), "Resume Text", 50, 10000):
        errors["resume_text"] = message
    if message := validate_string(data.get("education"), "Education", 1, 500):
        errors["education"] = message
    for field in ("skills", "projects", "certifications", "internships"):
        value = data.get(field)
        if not isinstance(value, list) or not all(isinstance(item, str) for item in value):
            errors[field] = "Must be a list of strings."
    return errors or None


def _build_resume_prompt(data: Dict[str, Any]) -> str:
    return RESUME_ANALYZER_USER_PROMPT_TEMPLATE.format(
        student_name=data.get("student_name", "Student"),
        career_goal=data.get("career_goal", "Not provided"),
        education=data.get("education", "Not provided"),
        skills=", ".join(data.get("skills", [])) or "Not provided",
        projects=", ".join(data.get("projects", [])) or "Not provided",
        certifications=", ".join(data.get("certifications", [])) or "Not provided",
        internships=", ".join(data.get("internships", [])) or "Not provided",
        resume_text=data.get("resume_text", "Not provided"),
    )


def _validate_resume_structure(data: Any) -> List[str]:
    required_keys = {
        "resumeScore", "strengths", "weaknesses", "missingSections",
        "missingSkills", "atsImprovementSuggestions", "betterProjectDescriptions",
        "betterSummary", "betterSkillsSection", "recommendedCertifications", "resumeImprovementPlan",
    }
    if not isinstance(data, dict):
        return ["Resume analysis response must be a JSON object."]
    if "resumeAnalysis" not in data:
        return ["Response is missing 'resumeAnalysis' object."]
    analysis = data.get("resumeAnalysis")
    if not isinstance(analysis, dict):
        return ["'resumeAnalysis' must be an object."]
    missing = required_keys - set(analysis.keys())
    if missing:
        return [f"Resume analysis is missing fields: {', '.join(sorted(missing))}."]
    if not isinstance(analysis.get("resumeScore"), (int, float)) or not (0 <= float(analysis.get("resumeScore", -1)) <= 100):
        return ["resumeScore must be a number between 0 and 100."]
    return []


@ai_bp.post("/resume-analyzer")
@jwt_required()
def resume_analyzer():
    user = _current_student()
    if not user:
        return not_found_response("Student account not found.")

    data, error = json_body()
    if error:
        return error

    validation_errors = _validate_resume_payload(data)
    if validation_errors:
        return error_response("Validation failed.", 422, validation_errors)

    if not Config.OPENROUTER_API_KEY:
        logger.error("OpenRouter API key is not configured.")
        return server_error_response("AI service is not configured.")

    prompt = _build_resume_prompt(data)
    messages = [
        {"role": "system", "content": RESUME_ANALYZER_SYSTEM_PROMPT},
        {"role": "user", "content": prompt},
    ]

    try:
        client = OpenRouterClient(
            api_key=Config.OPENROUTER_API_KEY,
            api_url=Config.OPENROUTER_API_URL,
            model=Config.OPENROUTER_MODEL,
            timeout=Config.OPENROUTER_TIMEOUT,
            max_retries=Config.OPENROUTER_MAX_RETRIES,
        )
        result = client.chat_completion(messages=messages, temperature=0.7, max_tokens=4096)
        raw_content = result["content"]
    except OpenRouterRateLimitError as exc:
        logger.warning("OpenRouter rate limit hit for user %s: %s", user.id, exc)
        return error_response("AI service is temporarily rate-limited. Please try again later.", 429)
    except OpenRouterTimeoutError as exc:
        logger.warning("OpenRouter timeout for user %s: %s", user.id, exc)
        return error_response("AI service timed out. Please try again later.", 504)
    except OpenRouterError as exc:
        logger.error("OpenRouter error for user %s: %s", user.id, exc)
        return server_error_response("AI service is currently unavailable.")
    except Exception as exc:
        logger.exception("Unexpected error calling OpenRouter for user %s.", user.id)
        return server_error_response("AI service is currently unavailable.")

    cleaned = _sanitize_json_string(raw_content)
    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        logger.error("OpenRouter returned non-JSON content for user %s. Raw: %s", user.id, raw_content[:500])
        return server_error_response("AI service returned an invalid response.")

    structure_errors = _validate_resume_structure(parsed)
    if structure_errors:
        logger.error("OpenRouter response structure invalid for user %s: %s. Raw: %s", user.id, structure_errors, raw_content[:500])
        return server_error_response("AI service returned an incompatible response structure.")

    return ok({"resumeAnalysis": parsed["resumeAnalysis"]}, "Resume analysis generated successfully.")
