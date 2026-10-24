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
