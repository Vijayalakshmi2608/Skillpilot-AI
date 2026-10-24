# SkillPilot AI / Career Compass

React 19 + TypeScript frontend (Vite) and a Python/Flask REST API backed by SQLite. AI requests are made by the backend through OpenRouter; the provider key must never be put in a frontend environment variable.

## Prerequisites

- Node.js 20 or newer and npm
- Python 3.11 (recommended) and `pip`
- A writable filesystem location for SQLite during development

## Local development

Install frontend dependencies and set the Vite API base URL:

```powershell
npm ci
Copy-Item .env.example .env.local
```

`.env.example` configures the same-origin `/api` base path. Vite proxies `/api` to `http://127.0.0.1:5000` during local development. For a separate API, set `VITE_API_URL` to its full API base URL, including `/api` (for example, `https://api.example.test/api`).

In a second terminal, configure and run Flask:

```powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env` and replace both development secret placeholders with distinct random values. Start the API:

```powershell
python app.py
```

Back at the repository root, start Vite:

```powershell
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). Local API health endpoints are `http://127.0.0.1:5000/` and `http://127.0.0.1:5000/api/health`.

## Environment variables

Copy the examples; do not commit `.env`, `.env.local`, or real credentials. Frontend `VITE_*` values are embedded in the public build and must contain no secrets.

| Variable | Component | Required / default | Purpose |
| --- | --- | --- | --- |
| `VITE_API_URL` | Frontend build | Optional; `/api` | API base URL, including `/api`. Use a full HTTPS URL for a separately hosted API. |
| `FLASK_ENV` | Backend | Optional; `development` | Set to `production` for deployed configuration checks. |
| `SECRET_KEY` | Backend | Required | Flask signing secret; use at least 32 random characters in production. |
| `JWT_SECRET_KEY` | Backend | Required | Separate JWT signing secret; use at least 32 random characters in production. |
| `DATABASE_URL` | Backend | Optional; SQLite file at `backend/database.db` | SQLAlchemy URL. For persistent hosting, use an absolute SQLite path on the platform's durable volume. |
| `CORS_ORIGINS` | Backend | Optional locally; two Vite localhost origins | Comma-separated frontend origins, without paths. Must be explicitly set to exact deployed origin(s) in production; wildcard is rejected. |
| `OPENROUTER_API_KEY` | Backend only | Optional; AI features require it | Private OpenRouter API key. Store it in backend/platform secret settings only. |
| `OPENROUTER_MODEL` | Backend | Optional; `openrouter/free` | Model identifier sent to OpenRouter. |
| `OPENROUTER_BASE_URL` | Backend | Optional; `https://openrouter.ai/api/v1` | OpenRouter API base URL. |
| `OPENROUTER_API_URL` | Backend | Optional; derived from base URL | Chat-completions endpoint override. |
| `OPENROUTER_TIMEOUT` | Backend | Optional; `60` seconds | Provider request timeout. |
| `OPENROUTER_MAX_RETRIES` | Backend | Optional; `3` | Retry count for provider requests. |
| `OPENROUTER_HTTP_REFERER` | Backend | Optional | Optional provider attribution header. |
| `OPENROUTER_APP_TITLE` | Backend | Optional; `SkillPilot AI` | Provider attribution title. |
| `JWT_ACCESS_TOKEN_HOURS` | Backend | Optional; `24` | Access-token lifetime. |
| `JWT_REFRESH_TOKEN_DAYS` | Backend | Optional; `30` | Refresh-token lifetime. |
| `MAX_CONTENT_LENGTH` | Backend | Optional; `2097152` bytes | Maximum request body size. |
| `PORT` | Backend server | Optional; `5000` | Development-server port; production WSGI hosts commonly provide this. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | Backend | Optional | If both email and password are set, provisions an initial admin at startup. Use platform secrets and a unique password if needed. |

Invalid or missing production secrets and missing, invalid, or wildcard production CORS settings stop startup with actionable messages; secret values are not included in those messages.

The optional development-only `backend/seed.py` script also reads `SEED_ADMIN_NAME`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_STUDENT_NAME`, `SEED_STUDENT_EMAIL`, and `SEED_STUDENT_PASSWORD`. Do not run this demonstration-account seeder on a production database.

## Database and persistence

On startup, the backend creates missing tables and verifies a SQLite connection. `create_all()` does not drop existing data, but it is not a schema migration system and does not update existing tables. `backend/seed_data.py` contains catalogue seed data and is intended to be run only when appropriate; `backend/seed.py` creates demonstration accounts and must not be used with production data.

The repository already tracks `backend/database.db`. This file was left unchanged; review its intended contents and privacy before publishing or using it as a deployment database. For hosted deployments, configure `DATABASE_URL` to a SQLite file on a **durable, writable persistent volume**. A container's working directory or temporary filesystem is not a durable volume. Back up the file before any upgrade or data move. Never point multiple app instances at a local SQLite file on independent disks.

SQLite is a single-file database with limited concurrent writes. It is suitable for a modest, single-instance deployment with reliable persistent storage and backups, not horizontally scaled instances or high write concurrency. Those cases need a managed server database and a planned database-driver/schema migration; no database migration is performed by these deployment instructions.

## Tests and production frontend build

Run backend tests from `backend`:

```powershell
python -m pytest tests
```

Run frontend type-check/build from the repository root:

```powershell
npm run typecheck
npm run build
```

The static production output is written to `dist/`. `VITE_API_URL` is a build-time setting; configure it in the frontend build environment before running `npm run build`. The frontend uses browser-history routes, so the static host must serve `index.html` as the fallback for application routes (for example `/login` and `/student/profile`). Keep asset serving rooted at `/` unless Vite's `base` setting is intentionally changed.

The built frontend contains no OpenRouter key: all provider calls are backend requests. Verify that by reviewing build output before release.

## Deployment (platform-neutral preparation)

No hosting provider or deployment URL has been selected, and no deployment has been performed. Do not create a paid service, publish the app, or change DNS without approval. Once a platform is selected, verify its current documented Python/Node runtime, persistent-volume, environment-variable, port-binding, and SPA-rewrite settings before deploying.

The backend now exposes `backend/wsgi.py` for production-capable WSGI servers. Requirements include Waitress. From the `backend` directory, a generic startup command is:

```sh
waitress-serve --listen=0.0.0.0:${PORT:-5000} wsgi:app
```

On Windows PowerShell without a platform-provided `PORT`, the equivalent local production-server check is:

```powershell
waitress-serve --listen=0.0.0.0:5000 wsgi:app
```

For a platform that builds both components from this repository, configure the backend working directory as `backend`, install `backend/requirements.txt`, and use the WSGI command above. Configure the frontend working directory as the repository root, run `npm ci` and `npm run build`, and publish `dist/`. The frontend's `VITE_API_URL` and backend's `CORS_ORIGINS` must match the actual API URL and frontend origin. A same-origin reverse proxy may route `/api/*` to the backend and use `VITE_API_URL=/api`; otherwise set the frontend's full backend API URL and allow the exact frontend origin in `CORS_ORIGINS`.

Before enabling production traffic:

1. Create secrets in the hosting platform (never in frontend build variables): distinct random `SECRET_KEY` and `JWT_SECRET_KEY` values of at least 32 characters; set `FLASK_ENV=production`.
2. Set `CORS_ORIGINS` to the exact HTTPS frontend origin(s), with no wildcard and no path.
3. Attach a persistent writable volume and point `DATABASE_URL` to a SQLite file on that volume. Confirm backup and restore procedures. Decide explicitly whether the existing tracked database contents are appropriate; do not overwrite or delete the existing database.
4. Set `OPENROUTER_API_KEY` only if AI features are required, along with any model selection. Configure usage limits with the provider.
5. Configure a backend health check against the existing `GET /api/health` route. `GET /` is also available. These endpoints report application availability; startup performs the database connection check.
6. Configure static-host SPA fallback to `index.html`, HTTPS, and the appropriate frontend/backend origins.
7. Deploy only after reviewing the platform-specific manual settings and obtaining any required approval.

## Deployment smoke-test checklist

Deployment tests have **not** been run because there is no selected host, deployed URL, or approved deployment access. After an approved deployment:

1. Open the deployed frontend and hard-refresh `/login` and `/student/profile` to verify static assets and SPA route fallback.
2. Request `GET <backend-origin>/api/health` and verify a successful JSON response; inspect server logs for startup errors.
3. Create a controlled test account with `POST /api/auth/register`, then sign in with `POST /api/auth/login`. Do not use real user data.
4. With the returned access token, read and update `GET/PATCH /api/students/me`, then read it again to verify profile persistence.
5. If provider access is configured, test one AI feature such as `POST /api/ai/chat`; verify provider errors are visible and no key is exposed in browser assets or logs.
6. In browser developer tools, confirm API requests go to the configured backend and review browser/server logs for errors. Remove the test account after testing if the application provides a safe supported deletion process.

## Troubleshooting and known limitations

- **Frontend requests wrong backend:** check `VITE_API_URL` at build time. Rebuild after changing it; it is not a runtime setting for an already-built static bundle.
- **CORS failure:** configure exact frontend origins in `CORS_ORIGINS` (scheme and hostname/port only), then restart the API. Do not use `*` in production.
- **Production refuses to start:** set two distinct random secrets of at least 32 characters and a valid explicit `CORS_ORIGINS` list; do not paste secret values into logs or tickets.
- **SQLite is read-only or data disappears:** set `DATABASE_URL` to the mounted durable volume and confirm the service user can write there.
- **AI features unavailable:** configure `OPENROUTER_API_KEY` on the backend, check provider account/model access and provider logs, and never add the key to `VITE_*`.
- **Direct route returns 404:** enable the static host's SPA fallback to `index.html`.
- **Schema changes:** `db.create_all()` only creates missing tables. Back up data and introduce/run a reviewed migration for schema changes before deploying.
- **Scaling:** local SQLite files are not shared between instances; use one instance or plan a server-database migration before scaling out.
- **Dependency audit (2026-10-24):** `npm audit` reports 7 advisories (3 moderate, 4 high); one high advisory affects production dependency `zod` and currently requires a major-version upgrade. Review and resolve/explicitly accept these findings before public release; avoid applying major dependency updates without checking compatibility.
