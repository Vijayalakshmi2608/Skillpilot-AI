# SkillPilot AI / Career Compass QA Audit

**Audit date:** 2026-10-26
**Scope:** Existing React/TypeScript frontend, Flask API, SQLite models and configured AI integrations. All browser/API tests used a synthetic QA account and a separate seeded SQLite file under local application data; the repository database was not used. Live OpenRouter requests were made with synthetic profile text only.

## Executive summary

The backend suite (53 tests), TypeScript check, and production build pass. Browser E2E verified registration, dashboard empty and populated states, assessment submission and result refresh, live career recommendations, roadmap generation/save/reload, logout, protected-route redirect, and re-login with user data restored. Live OpenRouter checks returned usable recommendations, chat, skill-gap/course, and resume responses; roadmap generation returned a clearly identified fallback. Auth/profile/assessment scoring, personalized dashboard data, recommendation response normalization/retry, chat context, and roadmap persistence/fallback messaging were fixed.

The previously identified integration blockers are resolved and retested. This audit still does **not** certify production readiness: testing used a local development configuration, one synthetic account, and a limited set of live provider calls. The README is effectively empty, and `package.json` has no frontend lint, unit-test, or browser-test script. Treat the result as staging-ready pending deployment-environment smoke tests, not as a claim that every application page or provider response has been exhaustively tested.

## Feature inventory

| Feature | Frontend surface | Backend contract / data | Audit result |
|---|---|---|---|
| Registration | `/register`, `StudentRegister.tsx`; stores access token through `AuthContext` | `POST /api/auth/register`; `users` | Implemented. Password minimum mismatch fixed (QA-02). API lifecycle tests pass. |
| Login / logout | `/login`; `AuthContext`; logout control in app shell | `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`, `POST /api/auth/refresh`; `users` | API lifecycle and controlled browser register/login/logout/relogin journey passed. Client logout clears local tokens; server logout is stateless. |
| Protected student routes | `/student/*`, `ProtectedRoute` and `StudentLayout` | JWT authentication; protected API handlers | Missing parent guard was fixed (QA-01). Browser verified `/student/dashboard` and `/student/profile` redirect to `/login` without a session. |
| User profile and updates | `/student/profile`, `StudentProfile.tsx` | `GET/PATCH /api/students/me`; `users`, optional `student_profiles` | Reads and updates user-bound profile. Editable email was previously ignored; now validated, normalized, uniqueness-checked and saved (QA-03). Regression tests pass. |
| Dashboard | `/student/dashboard`, `StudentDashboard.tsx` | `GET /api/students/me/dashboard`; authenticated profile, latest assessment, saved careers/roadmaps, notices, exams, scholarships, account activity | Uses user-scoped records and catalogue-backed opportunities with explicit empty/loading/error states. Browser tested before/after assessment and after relogin; sample data was removed (QA-06 fixed). |
| Career assessment | `/student/assessment`, `CareerAssessment.tsx` | `GET /api/assessment/questions`, `POST /api/assessment/submit`, `GET /api/assessment/results`; `assessment_questions`, `assessment_options`, `assessment_results`, `careers`, `career_domains` | UI loads server questions, submits selected option IDs, renders actual career matches, and reloads persisted results. Scoring/domain mismatch fixed (QA-04, QA-09). |
| AI career recommendations | `/student/recommendation`, `AiRecommendation.tsx` | `POST /api/ai/career-recommendation`; OpenRouter and authenticated `users` context | UI renders real provider recommendations and exposes provider errors. Prompt/schema normalization now handles common JSON variants while rejecting responses without career identity or score (QA-05 fixed). |
| Skill-gap analysis | `/student/skill-gap`, `SkillGapAnalyzer.tsx` | `POST /api/ai/skill-gap`; OpenRouter; no result persistence | Live UI request returned a valid analysis and rendered its skill-gap and course sections. |
| Course recommendations | Skill-gap results panel | Included as `courses` in `/api/ai/skill-gap` response; no separate endpoint or persistence | Real provider response included courses and rendered them in the UI. |
| Career roadmap | `/student/roadmap`, `CareerRoadmap.tsx` | `POST /api/ai/roadmap`; `POST/GET /api/students/me/roadmaps`; user-owned `career_roadmaps` model | Generated roadmap saves against a matching active catalog career and reloads after refresh/re-login. Unusable AI output is identified as a fallback (QA-07, QA-10 fixed). |
| AI career guidance | `/student/chat`, `CareerChat.tsx` | `POST /api/ai/chat`; OpenRouter; no conversation persistence | Real chat response rendered in the browser. Payload now includes available user profile fields rather than an empty object (QA-08 fixed). |
| Resume analyzer | `/student/resume-analyzer`, `ResumeAnalyzer.tsx` | `POST /api/ai/resume-analyzer`; OpenRouter | Real provider response returned a numeric score and expected analysis sections. |
| Loading / validation / errors / empty states | Auth pages, profile form, assessment and AI feature pages, shared loading screen | Flask JSON errors and JWT error handlers | Browser verified registration validation, assessment loading/submit/results, AI loading and clear errors, roadmap fallback warning, and recommendation error state. |

### Related implemented backend endpoints and data

- Auth: `/api/auth/register`, `/login`, `/me`, `/refresh`, `/logout`, `/forgot-password`, `/reset-password` use the `users` table.
- Profile: `/api/students/me` uses authenticated `users` identity and optional `student_profiles`.
- Assessment: `/api/assessment/questions`, `/submit`, `/results` use question/option tables and persist results keyed to the authenticated user.
- AI: `/api/ai/career-recommendation`, `/roadmap`, `/skill-gap`, `/chat`, `/resume-analyzer` use OpenRouter. Both mocked backend tests and selected real-provider requests were exercised.
- Catalog endpoints for careers, colleges, scholarships, resources and exams are registered, but the requested dashboard/recommendation/assessment screens do not consistently consume them.

## Test report

| Feature | Test case | Result | Evidence | Issue reference |
|---|---|---|---|---|
| Backend regression suite | Run all backend tests against in-memory SQLite | PASS | `python -m pytest backend/tests -q`: **53 passed**. Environment forced `DATABASE_URL=sqlite://`; existing `backend/database.db` was not used. | — |
| Frontend types | TypeScript project check | PASS | `npm run typecheck` completed with exit code 0. | — |
| Production frontend | TypeScript + Vite production build | PASS | `npm run build` completed; Vite transformed 2,738 modules. | — |
| Diff hygiene | Whitespace/error check | PASS | `git diff --check` produced no errors. | — |
| Registration password validation | Submit a 7-character password on `/register` | PASS | Browser displayed “Password must be at least 8 characters”; request was blocked by client validation. | QA-02 fixed |
| Protected navigation | Navigate logged out to dashboard and profile | PASS | Browser redirected both paths to `/login` after route fix. | QA-01 fixed |
| Registration, login, profile update, logout, relogin | Complete controlled browser journey and verify saved profile | PASS | Synthetic account registered, profile fields/email saved, values survived reload and logout/login; logged-out profile URL redirected to `/login`. | QA-01, QA-02, QA-03 fixed |
| Profile persistence and validation | Update email; read current user; reject invalid and duplicate emails | PASS | Isolated API test verified normalized email through `/api/auth/me`, invalid email returns 400, duplicate returns 409; browser profile persisted after reload. | QA-03 fixed |
| Assessment UI and persistence | Load questions, answer all, submit, reload and display latest result | PASS | Browser completed all 8 seeded questions; UI rendered actual matching careers and showed saved result after reload. Isolated second account sees no first account result. | QA-04, QA-09 fixed |
| CORS / auth header | Preflight from `http://localhost:5173` requesting JSON and Authorization | PASS | Flask test client returned 200 and allowed the origin and Authorization header. | — |
| Assessment domain scoring | Select seeded options, match selected domains to careers | PASS | Live UI results contained career records for mapped domains after fixing option-value scoring. | QA-09 fixed |
| Personalized dashboard | Verify empty state, assessment-backed matches, catalogue opportunities, and roadmap count | PASS | Browser showed the synthetic account-specific empty state, then assessment matches, scholarship and activity sections, and a saved roadmap after generation/relogin. Sample “Aarav” data was absent. API tests cover account scoping and catalogue data. | QA-06 fixed |
| Live skill gap and course recommendations | Generate analysis in browser and inspect returned sections | PASS | Real OpenRouter response returned `skillGapAnalysis`, numeric gap percentage and a `courses` array; UI rendered both sections. | — |
| Live career chat | Submit question in browser and render provider answer/resources/next steps | PASS | Actual `/api/ai/chat` response returned HTTP 200 and rendered assistant answer and resources. | QA-08 fixed |
| Live resume analyzer | Request analysis using synthetic sample text | PASS | Actual `/api/ai/resume-analyzer` response returned HTTP 200, score and analysis sections. | — |
| Live roadmap response handling | Generate roadmap and distinguish AI output from fallback | PASS | Provider/model output triggered `aiEnhanced: false`; UI displayed “AI roadmap unavailable” and identified fallback rather than claiming AI success. | QA-10 fixed |
| Live career recommendations | Generate recommendations with synthetic profile | PASS | Live OpenRouter endpoint returned HTTP 200 with five named recommendations and numeric scores; browser UI displayed five provider-generated career cards. | QA-05 fixed |
| Roadmap persistence | Generate roadmap, refresh and retrieve saved result | PASS | Browser generated a roadmap with the configured provider fallback, received HTTP 201 from the save route, reloaded it, and saw it persist on dashboard after logout/login. Separate API test verifies another account receives no saved roadmap. | QA-07 fixed |
| AI schema and invalid output | Normalize provider JSON, retry once on malformed output, and reject missing career identity | PASS | Backend tests verify wrapped/snake_case output normalization, a single retry after malformed JSON, and rejection of output without career identity. | QA-05 fixed |
| Browser runtime errors | Observe browser console and request errors | PASS WITH NOTE | Current live recommendation and roadmap requests succeeded; the browser emitted a transient Vite HMR websocket suspension during development, unrelated to the HTTP API, and no user-facing runtime failure was observed. | — |
| Frontend lint / unit tests | Run repository-configured checks | NOT TESTED | No `lint` or frontend `test` script is configured in `package.json`. | — |

## Confirmed bugs and reproduction

### Fixed and retested

- **QA-01 — Student pages were not protected (HIGH, fixed).** Before the fix, the `/student` route rendered `StudentLayout` without `ProtectedRoute`; only a subset of child pages had local guards. Reproduction: open `/student/dashboard` or `/student/profile` in a logged-out browser. The parent route now requires auth; both URLs were verified redirecting to `/login`.
- **QA-02 — Registration password rule disagreed with Flask (MEDIUM, fixed).** Reproduction: enter a 6- or 7-character password on `/register`. The UI accepted it, but Flask registration requires at least 8 characters. Frontend schema and hint now match the backend; a 7-character submission is blocked with an 8-character validation message.
- **QA-03 — Profile email edits were silently discarded (MEDIUM, fixed).** Reproduction: edit Email on `/student/profile` and save; the old server handler ignored `email` while returning success. The handler now validates and normalizes email, rejects duplicates, handles uniqueness races, and persists it. Added test verifies updated value through `/api/auth/me`, invalid input (400), and duplicate email (409).
- **QA-04 — Assessment UI was disconnected from persisted API (HIGH, fixed).** Reproduction: complete assessment; old UI showed local matches without submitting to Flask. The page now loads real questions, submits selected option IDs, renders the response, and fetches the latest saved result after reload. Browser verified an eight-answer submission and persisted result reload.
- **QA-05 — Career recommendation output contract failed against the configured model (HIGH, fixed and retested).** The prompt now specifies the expected response shape; backend normalization accepts common wrapped/snake_case variants and fills only optional display fields. Malformed or incompatible output gets one constrained retry; output still fails explicitly if identities/scores remain invalid. A live provider request returned five valid recommendations; the browser rendered them.
- **QA-06 — Dashboard displayed shared demo data (HIGH, fixed).** The dashboard now loads the authenticated user's profile completion, assessment-derived career matches, saved careers and saved roadmaps, with explicit empty/loading/error states. A synthetic user's empty and populated states were browser-verified; API tests verify no assessment or saved-career leakage between accounts.
- **QA-07 — Generated roadmaps were not saved (MEDIUM, fixed).** Generated roadmap data now saves against a matching active career-catalogue entry and reloads from `/api/students/me/roadmaps`. Browser verified save, refresh, dashboard display, logout and re-login persistence. API tests verify a second account cannot retrieve the saved roadmap.
- **QA-08 — Career chat omitted available user context (MEDIUM, fixed).** Reproduction: inspect the chat request; it sent an empty `student_profile`. It now includes available name, stream, city and education fields. A live browser request returned a valid assistant response.
- **QA-09 — Assessment scoring used question category instead of selected domain (HIGH, fixed).** Reproduction: answer the seeded assessment; the question categories were `interests`/`aptitude` while option values represented career domains, so result recommendations were empty. Scoring now uses categorical option values (with aliases) while retaining numeric-weight compatibility. Added a backend regression test and verified real seeded UI answers returned matching careers.
- **QA-10 — Roadmap fallback looked like successful AI output (MEDIUM, fixed).** Reproduction: a provider response that could not be parsed returned a fallback with `aiEnhanced: false`, but the UI showed a success toast. The UI now displays an explicit AI-unavailable warning and explains that the shown roadmap is a fallback; verified against a live provider response.

### Remaining limitations


- Roadmap persistence requires the selected career to match an active career-catalogue entry. A generated plan can still be displayed if it cannot be saved, and the UI warns that persistence failed.
- The dashboard shows global notices from the existing notification model; individual notices still reference the legacy `Student` table rather than the current `User` account.
- Cross-account isolation was directly tested for dashboard assessment/saved-career data and roadmap reads, plus assessment results. This is not a complete application-wide security audit.

## Blockers and deployment recommendation

- Live provider testing used synthetic profile data and one test account. Career recommendations, chat, skill-gap/courses, and resume analysis returned usable results; roadmap generation used a clear fallback. Provider quotas, repeatability, and broader model quality remain unverified.
- The controlled browser journey used an isolated seeded QA SQLite database, not production. It covered registration, profile update/reload, assessment submit/result reload, dashboard, recommendation rendering, roadmap save/reload, logout, protected redirect, and re-login.
- A transient Vite HMR websocket suspension appeared in the development browser; API-backed UI requests succeeded and no user-facing runtime failure was observed.
- No frontend lint, unit-test, or automated browser-test command is configured. Manual browser E2E checks were performed. README documentation is effectively empty.
- The repository's `backend/database.db` was not used or modified. Backend tests used in-memory SQLite; browser E2E used a separate seeded QA SQLite file and synthetic data only.

**Recommendation: Suitable for staging, but not certified production-ready by this audit.** The previously confirmed dashboard, recommendation-contract, and roadmap-persistence blockers are fixed and retested. Before production, run smoke tests against the actual deployment configuration, confirm provider quota/error behavior, and decide whether to add frontend automated tests and user-specific notification ownership. Important deployment assumptions remain untested, so the application is not labelled fully tested.
