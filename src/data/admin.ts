import type { ActivityItem } from "@/types";

export const adminStats = {
  students: 12540,
  activeAssessments: 3420,
  careers: 28,
  domains: 34,
  colleges: 320,
  scholarships: 145,
  exams: 22,
  resources: 480,
  newThisWeek: 780,
};

export const registrationTrend = [
  { month: "Mar", students: 620, assessments: 410 },
  { month: "Apr", students: 890, assessments: 610 },
  { month: "May", students: 1240, assessments: 870 },
  { month: "Jun", students: 1620, assessments: 1150 },
  { month: "Jul", students: 1980, assessments: 1420 },
  { month: "Aug", students: 2360, assessments: 1690 },
];

export const domainPopularity = [
  { name: "Tech & AI", value: 34 },
  { name: "Medicine", value: 22 },
  { name: "Commerce", value: 18 },
  { name: "Design & Media", value: 12 },
  { name: "Defence & Govt", value: 14 },
];

export const careerAnalytics = [
  { career: "AI/ML", interest: 86, applications: 62 },
  { career: "Software", interest: 82, applications: 58 },
  { career: "Medicine", interest: 74, applications: 55 },
  { career: "CA", interest: 68, applications: 40 },
  { career: "Data Science", interest: 64, applications: 44 },
  { career: "Design", interest: 52, applications: 30 },
];

export const scholarshipStats = [
  { name: "Applied", value: 3200 },
  { name: "Shortlisted", value: 980 },
  { name: "Awarded", value: 410 },
  { name: "Pending", value: 650 },
];

export const recentRegistrations = [
  { id: "STU241", name: "Karthik Rajan", domain: "Electronics", time: "2 min ago", color: "bg-gradient-to-br from-blue-600 to-indigo-600" },
  { id: "STU242", name: "Ishita Banerjee", domain: "Journalism", time: "14 min ago", color: "bg-gradient-to-br from-amber-500 to-orange-600" },
  { id: "STU243", name: "Dev Malhotra", domain: "Cloud Computing", time: "32 min ago", color: "bg-gradient-to-br from-sky-500 to-cyan-600" },
  { id: "STU244", name: "Nithya Subramanian", domain: "Dentistry", time: "48 min ago", color: "bg-gradient-to-br from-emerald-500 to-teal-600" },
  { id: "STU245", name: "Raghav Menon", domain: "AI / ML", time: "1 hr ago", color: "bg-gradient-to-br from-violet-500 to-purple-600" },
];

export const adminActivity: ActivityItem[] = [
  { id: "ad1", title: "New career domain added", detail: "Quantum Computing — 12 new careers", time: "1h ago", icon: "shapes", tone: "primary" },
  { id: "ad2", title: "Bulk scholarship import", detail: "34 scholarships synced from NSP feed", time: "3h ago", icon: "upload", tone: "accent" },
  { id: "ad3", title: "Analytics report generated", detail: "August monthly report (PDF)", time: "6h ago", icon: "chart", tone: "secondary" },
  { id: "ad4", title: "College data updated", detail: "2026 cutoffs refreshed for 120 colleges", time: "1d ago", icon: "building", tone: "warning" },
  { id: "ad5", title: "System health check passed", detail: "All services operational · 99.9% uptime", time: "1d ago", icon: "check", tone: "muted" },
];
