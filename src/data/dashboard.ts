import type { ActivityItem } from "@/types";

export const studentStats = {
  careerScore: 86,
  profileCompletion: 78,
  roadmapProgress: 64,
  skillProgress: 58,
  savedCareers: 9,
  notificationsUnread: 3,
  upcomingExams: 4,
  learningHours: 42,
  streak: 18,
};

export const weeklyLearningData = [
  { day: "Mon", hours: 2.5 },
  { day: "Tue", hours: 3.0 },
  { day: "Wed", hours: 1.5 },
  { day: "Thu", hours: 4.0 },
  { day: "Fri", hours: 2.0 },
  { day: "Sat", hours: 5.0 },
  { day: "Sun", hours: 3.5 },
];

export const careerMatchDistribution = [
  { name: "Tech", value: 38 },
  { name: "Medicine", value: 18 },
  { name: "Commerce", value: 22 },
  { name: "Design", value: 14 },
  { name: "Defence", value: 8 },
];

export const skillProgressData = [
  { skill: "Mathematics", value: 82 },
  { skill: "Physics", value: 74 },
  { skill: "Chemistry", value: 68 },
  { skill: "English", value: 90 },
  { skill: "Logical Reasoning", value: 76 },
];

export const recommendedCareers = ["ai-ml-engineer", "fullstack-developer", "data-scientist", "cyber-security", "digital-marketer"];

export const roadmapSteps = [
  { label: "Class 12", status: "done", detail: "PCM with 92%", icon: "graduation" },
  { label: "Degree", status: "current", detail: "B.Tech CSE (2027)", icon: "book" },
  { label: "Skills", status: "pending", detail: "Python · ML · SQL", icon: "code" },
  { label: "Certifications", status: "pending", detail: "AWS · TensorFlow", icon: "award" },
  { label: "Projects", status: "pending", detail: "2 flagship projects", icon: "rocket" },
  { label: "Internship", status: "pending", detail: "Summer 2028", icon: "briefcase" },
  { label: "Placement", status: "pending", detail: "Target: 2029", icon: "target" },
  { label: "Career Goal", status: "pending", detail: "ML Engineer @ Product Co", icon: "flag" },
];

export const studentActivity: ActivityItem[] = [
  { id: "a1", title: "Completed Career Assessment", detail: "Spatial reasoning & logic score 88/100", time: "2h ago", icon: "clipboard", tone: "primary" },
  { id: "a2", title: "Saved 2 new careers", detail: "AI/ML Engineer · Data Scientist", time: "5h ago", icon: "heart", tone: "accent" },
  { id: "a3", title: "Watched Python course module 3", detail: "Functions & classes (45 min)", time: "1d ago", icon: "play", tone: "secondary" },
  { id: "a4", title: "Scholarship reminder set", detail: "NTSE deadline: Nov 2026", time: "1d ago", icon: "bell", tone: "warning" },
  { id: "a5", title: "Roadmap updated", detail: "Degree phase marked as in-progress", time: "2d ago", icon: "map", tone: "muted" },
];

export const upcomingExamsForStudent = [
  { id: "jee-main", name: "JEE Main 2027", date: "Jan 2027", daysLeft: 165, color: "blue" },
  { id: "neet", name: "NEET-UG 2027", date: "May 2027", daysLeft: 285, color: "emerald" },
  { id: "bitsat", name: "BITSAT 2027", date: "Jun 2027", daysLeft: 320, color: "violet" },
  { id: "cuet", name: "CUET-UG 2027", date: "May 2027", daysLeft: 285, color: "amber" },
];

export const scholarshipHighlights = ["ntse", "nsp", "cbs", "tata"];
