import { Link } from "react-router-dom";
import { CheckCircle2, Compass, Sparkles } from "lucide-react";
import { Logo } from "@/components/common/Logo";

interface AuthLayoutProps {
  children: React.ReactNode;
  role?: "student" | "admin";
}

const highlights = [
  "AI career recommendations matched to your personality",
  "Roadmaps from Class 12 to your dream career",
  "College, scholarship and exam trackers that never miss a deadline",
];

function AuthLayout({ children, role = "student" }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-emerald-600 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl" />

        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2.5 text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <Compass className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold">Career Compass AI</span>
          </Link>
        </div>

        <div className="relative">
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/70">
            <Sparkles className="h-4 w-4" /> {role === "admin" ? "Admin Console" : "Student Portal"}
          </p>
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight text-white">
            {role === "admin"
              ? "Run the platform that guides India's students."
              : "Your career, navigated by AI."}
          </h1>
          <ul className="mt-8 space-y-3">
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 text-white/90">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-200" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/60">© 2026 Career Compass AI · Made for students, by students.</p>
      </div>

      {/* Form panel */}
      <div className="relative flex flex-col">
        <div className="flex items-center justify-between p-6">
          <Logo className="lg:hidden" />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-16 pt-4">{children}</div>
      </div>
    </div>
  );
}

export { AuthLayout };
