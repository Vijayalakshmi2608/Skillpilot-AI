# SkillPilot Backend

Flask REST API for student career discovery, colleges, scholarships, assessments, and administrative management. It uses SQLite, Flask-SQLAlchemy, JWT authentication, CORS, and bcrypt password hashing.

## Features

- Student authentication with JWT access and refresh tokens
- Career, college, scholarship, and assessment APIs
- Role-protected admin management APIs and audit logging
- SQLite-backed SQLAlchemy models and idempotent catalogue seed data
- JSON-only responses, CORS, security headers, request timing, and global API error handlers

## Structure

```text
backend/
  app.py                 # Application factory and entry point
  config.py              # Environment-backed configuration
  models/                # SQLAlchemy models and shared db instance
  routes/                # Flask Blueprints
  utils/                 # Authentication, validation, pagination, responses
  seed_data.py           # Idempotent catalogue seed command
  database.db            # SQLite database
```

## Installation

Use Python 3.10 or 3.11.

```powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Update `SECRET_KEY`, `JWT_SECRET_KEY`, `DATABASE_URL`, and `CORS_ORIGINS` in `.env`. Use long, random, distinct secrets in production. The default database URL should point to this project's `backend/database.db` file.

## Database and seed data

Tables are created safely on application startup; existing records are not dropped. Populate the catalogue with:

```powershell
py -3.11 seed_data.py
```

The seed command is idempotent, so it can be rerun without duplicate records.

## Run the backend

```powershell
py -3.11 app.py
```

The default API base URL is `http://127.0.0.1:5000`. `GET /` returns a backend health message. API endpoints retain their registered prefixes, including `/api/auth`, `/api/careers`, `/api/colleges`, `/api/scholarships`, `/api/assessment`, and `/api/admin`.

## Authentication

Register or log in through the auth Blueprint, then pass the access token on protected requests:

```http
Authorization: Bearer <access-token>
```

Example:

```powershell
Invoke-RestMethod http://127.0.0.1:5000/api/careers -Headers @{ Authorization = 'Bearer <access-token>' }
```

## Assessment → recommendations → roadmap

The authenticated student flow uses the existing endpoints and database records:

1. `GET /api/assessment/questions` loads the active questionnaire. `POST /api/assessment/submit` saves the selected question and option IDs and server-calculated domain scores to `assessment_results` for the authenticated user.
2. `GET /api/ai/career-recommendation` returns the latest saved AI recommendations without another provider call. If none exist yet, `POST /api/ai/career-recommendation` generates them from the latest saved answers and education fields on that same account. It stores the structured result beside the assessment. It ignores client-supplied profile claims as a source of personalization.
3. The student selects a saved recommendation. `POST /api/ai/roadmap` checks that career against the authenticated student's latest saved recommendations, then sends that recommendation, the stored assessment answers/scores, and the student-entered roadmap constraints to OpenRouter. The response retains the roadmap sections used by the UI and includes chronological `stages` with actions, milestones, duration, resources, estimated cost, and completion criteria.
4. The frontend saves generated plans through `POST /api/students/me/roadmaps`; records are scoped to the signed-in user and an existing career catalogue entry. A generated plan can still be viewed if the selected career is not in the catalogue, but that plan cannot be persisted until the catalogue supports that career.

All AI endpoints require a student JWT. Missing assessment answers return `409` with a next step; provider failures and malformed structured output return safe JSON errors. Match scores are estimates, not validated predictions. Salary, cost, and labour-market information from the model is not live-verified and must be checked against local official sources.

Run the mocked end-to-end API and provider tests without a real OpenRouter request:

```powershell
cd backend
python -m pytest -p no:cacheprovider tests
```

The tests set dummy signing secrets when none are already present and use mocked provider responses. A real OpenRouter request requires a configured backend key and should be performed separately against a controlled test account.

## Production notes

Use the production-capable WSGI entry point from this directory:

```sh
waitress-serve --listen=0.0.0.0:${PORT:-5000} wsgi:app
```

Set `FLASK_ENV=production`, two distinct random signing secrets (at least 32 characters), and exact frontend origins in `CORS_ORIGINS`. Configure `DATABASE_URL` to a persistent writable SQLite volume, back up data before upgrades, and do not run `seed.py` against production data. SQLite local files are not shared across instances, and `db.create_all()` does not migrate existing schemas. See the project README for all variables, deployment guidance, limitations, and smoke-test steps.

## Troubleshooting

- **Missing package:** activate the virtual environment and rerun `pip install -r requirements.txt`.
- **Secret configuration error:** copy `.env.example` to `.env` and set non-placeholder keys.
- **Database error:** verify that `DATABASE_URL` points to a writable SQLite file.
- **401 response:** provide a valid, unexpired `Authorization: Bearer` token.
- **403 response:** the authenticated role does not have permission for that endpoint.
