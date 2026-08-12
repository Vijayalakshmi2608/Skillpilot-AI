import type { ResumeTemplate } from "@/types";

export const resumeTemplates: ResumeTemplate[] = [
  { id: "modern", name: "Modern Blue", accent: "bg-blue-600", description: "Clean two-column layout with accent sidebar — best for tech and professional roles." },
  { id: "minimal", name: "Minimal Slate", accent: "bg-slate-700", description: "Single-column, typography-focused — timeless and recruiter-friendly." },
  { id: "accent", name: "Emerald Accent", accent: "bg-emerald-600", description: "Bold headers with emerald accents — great for creative and growth roles." },
];

export const resumeSections = [
  { id: "contact", label: "Contact Information", fields: ["Full Name", "Email", "Phone", "Location"] },
  { id: "education", label: "Education", fields: ["School / College", "Stream", "Percentage / CGPA", "Year"] },
  { id: "skills", label: "Skills", fields: ["Add skills (comma separated)"] },
  { id: "projects", label: "Projects", fields: ["Project title", "Description"] },
  { id: "achievements", label: "Achievements", fields: ["Achievement"] },
];
