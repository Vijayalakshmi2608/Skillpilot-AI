# Career Compass AI 🧭

A production-quality, **frontend-only** career guidance portal for Class 12 students — built for a national-level hackathon / final-year CSE project.

> **Frontend only:** all data is mock JSON. No backend, no database, no real authentication, no API calls, no localStorage persistence. Every button, form and download is a UI-only interaction.

## ✨ Features

### Public
- Landing page, About, Features, Career Domains (34 domains), Career Explorer (25+ careers), Career Comparison, Scholarship Finder, College Finder, Entrance Exams, Learning Resources, Success Stories, FAQ, Contact, 404

### Student (15+ pages)
- Dashboard, Profile, multi-step Career Assessment, AI Career Recommendation, Career DNA Report (radar chart), interactive Career Roadmap timeline, Skill Gap Analyzer, Career Comparison, College Finder, Scholarship Finder, Resume Builder (live preview), Saved Careers, Notifications, Settings, Help Center

### Admin (13 pages)
- Dashboard, Analytics, Reports, Notifications, Settings + management tables for Students, Careers, Colleges, Scholarships, Exams, Domains and Resources (search / filter / pagination / row actions)

## 🛠 Tech Stack

- **React 19** + **TypeScript** + **Vite 6**
- **Tailwind CSS** (dark/light mode, glassmorphism, design tokens)
- **shadcn-style UI primitives** (hand-rolled, accessible)
- **Framer Motion** (page/route/scroll animations)
- **React Router DOM v7** (lazy-loaded routes)
- **React Hook Form + Zod** (form validation, UI only)
- **Recharts** (radar, bar, area, donut charts)
- **Lucide React** icons, **Sonner** toasts

## 🚀 Getting Started

```bash
bun install        # install dependencies
bun run dev        # start dev server on http://localhost:5173
bun run build      # typecheck + production build (dist/)
```

Preview (Freebuff) commands are configured via `freebuff-preview`:

```bash
freebuff-preview set-install "bun install"
freebuff-preview set "bun run dev" 5173
freebuff-preview set-build "vite build"
freebuff-preview start   # launch the preview
```

## 🔑 Environment Variables

**None required.** The app is fully self-contained with mock data. (When a real backend/auth is added later, `VITE_API_URL` will be the first env var to introduce.)

## 🗂 Structure

```
src/
├── components/   ui/ · common/ · cards/ · charts/ · layout/
├── layouts/      Public · Student · Admin · Auth
├── pages/        public/ · auth/ · student/ · admin/   (45 pages)
├── routes/       lazy-loaded route tree
├── data/         mock JSON (careers, colleges, scholarships, ...)
├── types/ · hooks/ · lib/ · utils/ · styles/
```

## 👤 Demo Accounts (UI only)

- **Student:** any valid email/password → `/student/dashboard`
- **Admin:** `/admin/login` (email + 6-digit OTP, any values)

## License

MIT — © 2026 Career Compass AI
