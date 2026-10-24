import requests
import uuid
import time

BASE = "http://127.0.0.1:5000/api"

def register():
    email = f"test_user_{int(time.time())}@example.com"
    payload = {"fullName": "Test User", "email": email, "password": "Password123!"}
    r = requests.post(f"{BASE}/auth/register", json=payload)
    print("REGISTER ->", r.status_code, r.text)
    return r.json() if r.ok else None


def call_chat(token):
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    payload = {"message": "What career paths suit someone interested in AI and data?", "student_profile": {"name": "Test User", "currentSkills": ["Python"]}}
    r = requests.post(f"{BASE}/ai/chat", json=payload, headers=headers)
    print("CHAT ->", r.status_code, r.text)
    return r


def call_skill_gap(token):
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    payload = {
        "student_name": "Test User",
        "selected_career": "AI/ML Engineer",
        "current_skills": ["Python"],
        "technical_skills": ["Python"],
        "soft_skills": ["Communication"],
        "projects": ["Personal website"],
        "certifications": ["None"],
        "education": "B.Tech",
        "experience": ""
    }
    r = requests.post(f"{BASE}/ai/skill-gap", json=payload, headers=headers)
    print("SKILL-GAP ->", r.status_code, r.text)
    return r


if __name__ == '__main__':
    res = register()
    if not res:
        print('Registration failed; aborting')
    else:
        token = res.get('data', {}).get('accessToken') or res.get('accessToken') or res.get('data', {}).get('access_token')
        print('TOKEN:', 'present' if token else 'missing')
        if token:
            call_chat(token)
            call_skill_gap(token)
