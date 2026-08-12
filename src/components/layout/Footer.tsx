import { Link } from "react-router-dom";
import { Compass, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/common/Logo";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", to: "/features" },
      { label: "Career Domains", to: "/domains" },
      { label: "Career Explorer", to: "/explore" },
      { label: "College Finder", to: "/colleges" },
      { label: "Scholarship Finder", to: "/scholarships" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Entrance Exams", to: "/exams" },
      { label: "Learning Resources", to: "/resources" },
      { label: "Success Stories", to: "/stories" },
      { label: "Career Comparison", to: "/compare" },
      { label: "FAQ", to: "/faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "Student Login", to: "/login" },
      { label: "Admin Login", to: "/admin/login" },
    ],
  },
];

function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              AI-powered career guidance for Class 12 students — discover your strengths, explore
              careers, and build a roadmap to your dream future.
            </p>
            <div className="mt-5 space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@careercompass.ai</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 98765 43210</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Chennai, Tamil Nadu</p>
            </div>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">© 2026 Career Compass AI. Made for students, by students.</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Compass className="h-3.5 w-3.5 text-primary" />
            Your career, your compass.
          </div>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
