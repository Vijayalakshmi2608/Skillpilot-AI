"""Idempotent development catalogue seed for the SkillPilot SQLite database.

Run from the backend directory with ``py -3.11 seed_data.py`` (or from the
repository root with ``py -3.11 backend/seed_data.py``).  Existing records are
never deleted or overwritten; natural keys are checked before every insert.
"""
from __future__ import annotations

from datetime import date
import re

from app import app
from models import (
    AssessmentOption,
    AssessmentQuestion,
    Career,
    CareerDomain,
    CareerRoadmap,
    College,
    Scholarship,
    Skill,
    User,
    db,
)


DOMAIN_ROLES = {
    "Engineering": ["Software Engineer", "Electrical Engineer", "Chemical Engineer", "Industrial Engineer"],
    "Medical": ["Doctor", "Surgeon", "Physiotherapist", "Medical Laboratory Technologist"],
    "IT": ["Full Stack Developer", "Systems Administrator", "IT Support Specialist", "DevOps Engineer"],
    "AI & Machine Learning": ["Machine Learning Engineer", "AI Research Scientist", "Computer Vision Engineer", "NLP Engineer"],
    "Data Science": ["Data Scientist", "Data Analyst", "Business Intelligence Analyst", "Data Engineer"],
    "Cyber Security": ["Cyber Security Analyst", "Ethical Hacker", "Security Engineer", "Digital Forensics Analyst"],
    "Cloud Computing": ["Cloud Architect", "Cloud Engineer", "Cloud Security Specialist", "Site Reliability Engineer"],
    "Civil Services": ["IAS Officer", "IPS Officer", "Indian Foreign Service Officer", "State Civil Services Officer"],
    "Commerce": ["Chartered Accountant", "Company Secretary", "Cost Accountant", "Tax Consultant"],
    "Finance": ["Financial Analyst", "Investment Banker", "Financial Planner", "Risk Analyst"],
    "Law": ["Advocate", "Corporate Lawyer", "Legal Advisor", "Cyber Law Specialist"],
    "Education": ["School Teacher", "Special Educator", "Education Counsellor", "Curriculum Designer"],
    "Agriculture": ["Agricultural Officer", "Agronomist", "Food Technologist", "Agribusiness Manager"],
    "Biotechnology": ["Biotechnologist", "Clinical Research Associate", "Bioinformatics Scientist", "Microbiologist"],
    "Design": ["UX Designer", "Graphic Designer", "Fashion Designer", "Product Designer"],
    "Animation": ["3D Animator", "VFX Artist", "Game Artist", "Motion Graphics Designer"],
    "Media": ["Media Planner", "Content Strategist", "Film Editor", "Radio Producer"],
    "Journalism": ["Journalist", "News Reporter", "Investigative Reporter", "Digital Journalist"],
    "Hospitality": ["Hotel Manager", "Chef", "Event Manager", "Restaurant Manager"],
    "Aviation": ["Commercial Pilot", "Aircraft Maintenance Engineer", "Air Traffic Controller", "Cabin Crew"],
    "Defence": ["Indian Army Officer", "Indian Navy Officer", "Indian Air Force Officer", "Defence Research Scientist"],
    "Psychology": ["Clinical Psychologist", "Counselling Psychologist", "Organisational Psychologist", "Behaviour Therapist"],
    "Sports": ["Sports Coach", "Sports Physiotherapist", "Fitness Trainer", "Sports Manager"],
    "Government": ["Public Policy Analyst", "Government Accountant", "Municipal Planner", "Social Welfare Officer"],
    "Entrepreneurship": ["Startup Founder", "Product Manager", "Business Development Manager", "Social Entrepreneur"],
    "Renewable Energy": ["Solar Energy Engineer", "Wind Energy Engineer", "Energy Auditor", "Sustainability Consultant"],
    "Robotics": ["Robotics Engineer", "Automation Engineer", "Mechatronics Engineer", "Robotics Technician"],
    "Electronics": ["Electronics Engineer", "Embedded Systems Engineer", "VLSI Design Engineer", "IoT Engineer"],
    "Mechanical": ["Mechanical Design Engineer", "Automotive Engineer", "Manufacturing Engineer", "Maintenance Engineer"],
    "Civil Engineering": ["Civil Engineer", "Structural Engineer", "Construction Manager", "Quantity Surveyor"],
    "Pharmacy": ["Pharmacist", "Pharmaceutical Researcher", "Drug Safety Associate", "Clinical Pharmacist"],
    "Architecture": ["Architect", "Urban Planner", "Landscape Architect", "Interior Architect"],
}


SKILLS_BY_CATEGORY = {
    "Programming": "Python Java C C++ C# JavaScript TypeScript Go Rust Kotlin Swift PHP Ruby R MATLAB Scala Racket Bash PowerShell HTML CSS React Angular Vue Flask Django FastAPI Spring Boot Node.js REST API GraphQL Git GitHub GitLab Docker Kubernetes Terraform Ansible Linux Windows Android iOS Flutter React-Native",
    "Data and AI": "SQL MySQL SQLite PostgreSQL Oracle MongoDB Redis Apache Spark Hadoop Kafka ETL Data Warehousing Data Modelling Tableau Power BI Excel Statistics Probability Linear Algebra Calculus Machine Learning Deep Learning Neural Networks Natural Language Processing Computer Vision Reinforcement Learning TensorFlow PyTorch Scikit-learn Pandas NumPy Matplotlib Data Visualisation A/B Testing Feature Engineering MLOps",
    "Cloud and Security": "AWS Microsoft Azure Google Cloud Cloud Computing Cloud Architecture Cloud Security Networking TCP/IP DNS HTTP VPN Firewalls SIEM SOC Penetration Testing Ethical Hacking Cryptography Incident Response Digital Forensics Identity Management DevSecOps OWASP Vulnerability Assessment Wireshark Nmap Linux Administration System Design Site Reliability Monitoring Prometheus Grafana",
    "Business and Finance": "Accounting Bookkeeping Financial Analysis Financial Modelling Budgeting Taxation GST Auditing Investment Analysis Risk Management Insurance Equity Research Banking Tally ERP SAP Business Analysis Market Research Sales Negotiation Digital Marketing SEO SEM Social Media Marketing Content Marketing Brand Management Customer Relationship Management Project Management Agile Scrum Product Management Entrepreneurship",
    "Communication and Leadership": "Communication Public Speaking Leadership Teamwork Problem Solving Critical Thinking Decision Making Time Management Adaptability Creativity Emotional Intelligence Conflict Resolution Mentoring Presentation Skills Technical Writing Research Report Writing Client Management Stakeholder Management Collaboration Attention to Detail Ethics",
    "Design and Media": "UI/UX Figma Adobe Photoshop Adobe Illustrator Adobe Premiere Pro After Effects Blender Maya AutoCAD CAD SolidWorks Sketching Typography Colour Theory Wireframing Prototyping User Research Animation 3D Modelling Video Editing Photography Cinematography Storytelling Journalism Copywriting",
    "Engineering and Science": "Robotics Electronics Arduino Raspberry Pi Embedded Systems PLC SCADA VLSI PCB Design Circuit Design Control Systems Mechanical Design Thermodynamics Fluid Mechanics Finite Element Analysis Civil Engineering Structural Analysis Surveying Construction Management Geotechnical Engineering Renewable Energy Solar PV Wind Energy Biotechnology Microbiology Genetics Bioinformatics Clinical Research Pharmacology Chemistry Physics",
    "Health and Education": "First Aid Patient Care Clinical Documentation Anatomy Physiology Diagnostics Medical Ethics Counselling Psychology Behavioural Assessment Teaching Lesson Planning Classroom Management Curriculum Development Special Education Sports Coaching Fitness Training Nutrition Hospitality Management Food Safety Aviation Safety",
    "Agriculture and Law": "Agronomy Soil Science Irrigation Crop Management Pest Management Food Processing Supply Chain Management Environmental Impact Assessment Sustainability GIS Remote Sensing Legal Research Contract Drafting Litigation Intellectual Property Corporate Law Constitutional Law Public Policy Governance",
}

# Preserve commonly recognised multi-word skill names in addition to the broad
# token catalogue above.  These are the strings used by career requirements and
# client-side filters (for example, "Machine Learning" rather than two tokens).
MULTIWORD_SKILLS = {
    "Programming": ["Object Oriented Programming", "Version Control", "Web Development", "Mobile Development"],
    "Data and AI": ["Machine Learning", "Deep Learning", "Natural Language Processing", "Computer Vision", "Data Analysis", "Data Science", "Data Engineering", "Data Visualisation", "Business Intelligence", "Statistical Analysis", "Database Design"],
    "Cloud and Security": ["Cloud Computing", "Cloud Architecture", "Cloud Security", "Network Security", "Ethical Hacking", "Incident Response", "Digital Forensics", "System Design", "Site Reliability Engineering", "Identity and Access Management"],
    "Business and Finance": ["Public Relations", "Financial Planning", "Investment Banking", "Project Management", "Product Management", "Digital Marketing", "Search Engine Optimisation", "Business Development", "Customer Relationship Management"],
    "Communication and Leadership": ["Public Speaking", "Problem Solving", "Critical Thinking", "Time Management", "Emotional Intelligence", "Conflict Resolution", "Technical Writing", "Report Writing", "Stakeholder Management", "Attention to Detail"],
    "Design and Media": ["User Experience Design", "User Interface Design", "User Research", "Motion Graphics", "Video Editing", "3D Modelling", "Colour Theory"],
    "Engineering and Science": ["Machine Design", "Mechanical Design", "Circuit Design", "PCB Design", "Control Systems", "Structural Analysis", "Construction Management", "Renewable Energy", "Clinical Research"],
    "Health and Education": ["Patient Care", "Medical Ethics", "Lesson Planning", "Classroom Management", "Sports Coaching", "Fitness Training", "Food Safety", "Aviation Safety"],
    "Agriculture and Law": ["Soil Science", "Crop Management", "Food Processing", "Supply Chain Management", "Environmental Impact Assessment", "Legal Research", "Contract Drafting", "Corporate Law", "Public Policy"],
}


COLLEGES = [
    ("Indian Institute of Technology Madras", "Tamil Nadu", "Chennai", "Government", "Engineering", 800000, "JEE Advanced", "https://www.iitm.ac.in"),
    ("Indian Institute of Technology Delhi", "Delhi", "New Delhi", "Government", "Engineering", 800000, "JEE Advanced", "https://home.iitd.ac.in"),
    ("Indian Institute of Technology Bombay", "Maharashtra", "Mumbai", "Government", "Engineering", 800000, "JEE Advanced", "https://www.iitb.ac.in"),
    ("All India Institute of Medical Sciences Delhi", "Delhi", "New Delhi", "Government", "Medical", 100000, "NEET UG", "https://www.aiims.edu"),
    ("Christian Medical College", "Tamil Nadu", "Vellore", "Private", "Medical", 650000, "NEET UG", "https://www.cmch-vellore.edu"),
    ("National Law School of India University", "Karnataka", "Bengaluru", "Government", "Law", 1200000, "CLAT", "https://www.nls.ac.in"),
    ("Indian Institute of Science", "Karnataka", "Bengaluru", "Government", "Science", 600000, "GATE", "https://iisc.ac.in"),
    ("Delhi University", "Delhi", "New Delhi", "Government", "Arts & Science", 150000, "CUET", "https://www.du.ac.in"),
    ("Jamia Millia Islamia", "Delhi", "New Delhi", "Government", "Arts & Science", 180000, "CUET", "https://www.jmi.ac.in"),
    ("Vellore Institute of Technology", "Tamil Nadu", "Vellore", "Private", "Engineering", 900000, "VITEEE", "https://vit.ac.in"),
    ("Manipal Academy of Higher Education", "Karnataka", "Udupi", "Private", "University", 1200000, "MET", "https://manipal.edu"),
    ("National Institute of Fashion Technology Delhi", "Delhi", "New Delhi", "Government", "Design", 1000000, "NIFT Entrance", "https://www.nift.ac.in"),
]


SCHOLARSHIPS = [
    ("Central Sector Scheme of Scholarship", "Ministry of Education", 12000, "2027-10-31", "Government", ["Class 12", "Merit", "Indian citizen"]),
    ("AICTE Pragati Scholarship", "AICTE", 50000, "2027-11-30", "Government", ["Female", "Technical education", "Family income criteria"]),
    ("AICTE Saksham Scholarship", "AICTE", 50000, "2027-11-30", "Government", ["Disability", "Technical education"]),
    ("National Scholarship Portal Pre-Matric", "Ministry of Minority Affairs", 10000, "2027-09-30", "Government", ["Minority", "School student"]),
    ("INSPIRE Scholarship", "Department of Science and Technology", 80000, "2027-12-31", "Government", ["Science", "Merit"]),
    ("Reliance Foundation Undergraduate Scholarship", "Reliance Foundation", 200000, "2027-10-15", "Private", ["Undergraduate", "Merit", "Financial need"]),
    ("Tata Capital Pankh Scholarship", "Tata Capital", 12000, "2027-08-31", "Private", ["School student", "Financial need"]),
    ("HDFC Bank Parivartan Scholarship", "HDFC Bank", 75000, "2027-09-15", "Private", ["Merit", "Financial need"]),
    ("Sitaram Jindal Foundation Scholarship", "Sitaram Jindal Foundation", 48000, "2027-07-31", "Private", ["Merit", "Income criteria"]),
    ("Post Matric Scholarship for SC Students", "Ministry of Social Justice", 60000, "2027-10-31", "Government", ["SC", "Post matric"]),
    ("Post Matric Scholarship for ST Students", "Ministry of Tribal Affairs", 60000, "2027-10-31", "Government", ["ST", "Post matric"]),
    ("OBC Scholarship", "State Education Department", 40000, "2027-10-31", "Government", ["OBC", "Income criteria"]),
]


QUESTIONS = [
    ("Which activity do you enjoy most?", "interests", [("Solving technical problems", "technology"), ("Helping people directly", "health"), ("Creating visual work", "design"), ("Leading teams and businesses", "business")]),
    ("Which school subject best matches your strengths?", "aptitude", [("Mathematics", "technology"), ("Biology", "health"), ("Economics", "business"), ("Languages", "humanities")]),
    ("What kind of work environment do you prefer?", "work_style", [("Laboratory or research centre", "research"), ("Office and technology team", "technology"), ("Outdoor or field work", "field"), ("Creative studio", "design")]),
    ("How do you prefer to solve a new problem?", "aptitude", [("Analyse data", "data"), ("Build and test a prototype", "engineering"), ("Discuss with people", "communication"), ("Study rules and evidence", "law")]),
    ("What matters most in a career?", "values", [("Social impact", "public_service"), ("Innovation", "technology"), ("Financial growth", "business"), ("Creative expression", "design")]),
    ("Which project would you choose?", "interests", [("Build a robot", "robotics"), ("Plan a community health camp", "health"), ("Design a mobile app", "technology"), ("Write a news story", "media")]),
    ("How comfortable are you with public speaking?", "communication", [("Very comfortable", "leadership"), ("Comfortable with preparation", "communication"), ("Prefer written communication", "research"), ("Prefer hands-on work", "technical")]),
    ("Which challenge interests you most?", "interests", [("Protecting digital systems", "security"), ("Improving the environment", "sustainability"), ("Managing investments", "finance"), ("Teaching young learners", "education")]),
]


def _slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def _get_or_create(model, defaults=None, **filters):
    instance = model.query.filter_by(**filters).first()
    if instance is not None:
        return instance, False
    instance = model(**filters, **(defaults or {}))
    db.session.add(instance)
    return instance, True


def seed_domains_and_careers():
    """Create 32 domains and 128 realistic career records."""
    domains = {}
    for name in DOMAIN_ROLES:
        domain, _ = _get_or_create(CareerDomain, name=name, defaults={
            "slug": _slug(name),
            "description": f"Career paths, education options, and opportunities in {name}.",
            "is_active": True,
        })
        domains[name] = domain
    db.session.flush()

    created = 0
    for domain_name, roles in DOMAIN_ROLES.items():
        for index, title in enumerate(roles):
            career = Career.query.filter(func_lower(Career.title) == title.lower()).first()
            if career is None:
                skills = ["Communication", "Problem Solving", "Teamwork", title.split()[0]]
                career = Career(
                    domain_id=domains[domain_name].id,
                    title=title,
                    description=f"{title} is a career path in {domain_name} for learners who enjoy practical problem solving and continuous learning.",
                    eligibility="Relevant Class 12 subjects and a recognised diploma or degree, depending on the role.",
                    skills=skills,
                    salary_range=f"₹{4 + index}–{10 + index * 2} LPA",
                    growth_rate=round(5.0 + index * 1.5, 1),
                    demand_score=70 + index * 5,
                    education_path=["Complete Class 12", "Earn a relevant diploma or degree", "Build projects or internships"],
                    is_active=True,
                )
                db.session.add(career)
                created += 1
    return created


def func_lower(column):
    """Delay importing SQL helpers while retaining case-insensitive natural keys."""
    from sqlalchemy import func
    return func.lower(column)


def seed_skills():
    created = 0
    for category, raw_names in SKILLS_BY_CATEGORY.items():
        # Slash and hyphenated names are deliberate individual skill names.
        for name in raw_names.split(" "):
            skill, was_created = _get_or_create(Skill, name=name, defaults={
                "category": category,
                "description": f"Practical {name} capability for study and employment.",
            })
            created += int(was_created)
    for category, names in MULTIWORD_SKILLS.items():
        for name in names:
            _, was_created = _get_or_create(Skill, name=name, defaults={
                "category": category,
                "description": f"Practical {name} capability for study and employment.",
            })
            created += int(was_created)
    return created


def seed_colleges(domains):
    created = 0
    for name, state, district, college_type, domain_name, fees, cutoff, website in COLLEGES:
        if College.query.filter(func_lower(College.name) == name.lower()).first() is None:
            db.session.add(College(
                name=name, state=state, district=district, college_type=college_type,
                domain_id=domains.get(domain_name).id if domains.get(domain_name) else None,
                fees=fees, cutoff=cutoff, website=website, courses=[], is_active=True,
            ))
            created += 1
    return created


def seed_scholarships():
    created = 0
    for title, provider, amount, deadline, category, eligibility in SCHOLARSHIPS:
        if Scholarship.query.filter(func_lower(Scholarship.name) == title.lower()).first() is None:
            db.session.add(Scholarship(
                name=title, provider=provider, amount=amount, deadline=date.fromisoformat(deadline),
                category=category, eligibility=eligibility, benefits=[f"Up to ₹{amount:,} financial support"],
                is_active=True,
            ))
            created += 1
    return created


def seed_assessments():
    created = 0
    for question_text, category, options in QUESTIONS:
        question = AssessmentQuestion.query.filter_by(question=question_text).first()
        if question is None:
            question = AssessmentQuestion(question=question_text, category=category, display_order=created + 1, is_active=True)
            db.session.add(question)
            db.session.flush()
            created += 1
        for order, (text, value) in enumerate(options, start=1):
            if not AssessmentOption.query.filter_by(question_id=question.id, display_order=order).first():
                db.session.add(AssessmentOption(question_id=question.id, option_text=text, value=value, display_order=order))
    return created


def seed_roadmaps():
    """Optionally add two roadmaps for an existing student, never creating users."""
    student = User.query.filter_by(role="student").order_by(User.id).first()
    careers = Career.query.order_by(Career.id).limit(2).all()
    if student is None or not careers:
        return 0
    created = 0
    for career in careers:
        exists = CareerRoadmap.query.filter_by(user_id=student.id, career_id=career.id).first()
        if exists is None:
            db.session.add(CareerRoadmap(
                user_id=student.id, career_id=career.id, title=f"{career.title} learning roadmap",
                milestones=["Understand career fundamentals", "Complete a beginner course", "Build a portfolio project", "Apply for an internship"],
                progress=0, is_completed=False,
            ))
            created += 1
    return created


def seed_database():
    """Seed catalogue data in one transaction and return inserted-record counts."""
    with app.app_context():
        try:
            db.create_all()
            careers = seed_domains_and_careers()
            domains = {item.name: item for item in CareerDomain.query.all()}
            counts = {
                "careers": careers,
                "skills": seed_skills(),
                "colleges": seed_colleges(domains),
                "scholarships": seed_scholarships(),
                "assessment_questions": seed_assessments(),
                "career_roadmaps": seed_roadmaps(),
            }
            db.session.commit()
            return counts
        except Exception:
            db.session.rollback()
            raise


if __name__ == "__main__":
    results = seed_database()
    print("Seed completed:", ", ".join(f"{key}={value}" for key, value in results.items()))
