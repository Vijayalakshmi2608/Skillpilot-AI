export type Tone =
  | "primary"
  | "secondary"
  | "accent"
  | "muted"
  | "success"
  | "warning"
  | "destructive"
  | "outline";

export interface Career {
  id: string;
  title: string;
  domain: string;
  icon: string;
  description: string;
  salary: string;
  demand: "Very High" | "High" | "Moderate" | "Growing";
  demandScore: number; // 0-100
  growth: number; // %
  fees: string;
  match?: number; // % match for a student
  skills: string[];
  educationPath: string[];
  futureScope: string;
  pros: string[];
  cons: string[];
  color: string; // tailwind gradient classes
}

export interface CareerDomain {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  careers: number;
  color: string;
  description: string;
}

export interface College {
  id: string;
  name: string;
  state: string;
  district: string;
  cutoff: string;
  fees: string;
  placement: number;
  avgPackage: string;
  hostel: boolean;
  ranking: number;
  rating: number;
  courses: string[];
  type: "Government" | "Private" | "Deemed" | "IIT" | "NIT";
  color: string;
}

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: string;
  eligibility: string[];
  deadline: string;
  benefits: string[];
  category: string;
}

export interface EntranceExam {
  id: string;
  name: string;
  conductingBody: string;
  level: "Class 12" | "UG Entrance";
  mode: "Online" | "Offline" | "Hybrid";
  examDate: string;
  registrationDeadline: string;
  seats: string;
  domains: string[];
  color: string;
}

export interface Resource {
  id: string;
  title: string;
  type: "Video" | "Article" | "Course" | "Book" | "Quiz" | "PDF";
  domain: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  rating: number;
  provider: string;
}

export interface SuccessStory {
  id: string;
  name: string;
  domain: string;
  achievement: string;
  quote: string;
  year: string;
  initials: string;
  color: string;
}

export interface Faq {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  stream: string;
  domain: string;
  progress: number;
  joined: string;
  status: "Active" | "Pending" | "Inactive";
  city: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "exam" | "scholarship" | "career" | "system";
  read: boolean;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  icon: string;
  options: string[];
}

export interface ResumeTemplate {
  id: string;
  name: string;
  accent: string;
  description: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  icon: string;
  tone: Tone;
}
