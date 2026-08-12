import { Outlet } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import {
  BookOpen,
  Building2,
  ClipboardList,
  Compass,
  FileText,
  GraduationCap,
  Heart,
  HelpCircle,
  LineChart,
  Map,
  MessageSquare,
  Puzzle,
  ScrollText,
  Sparkles,
  Target,
  User,
  Bell,
  Settings,
} from "lucide-react";
import type { SidebarSection } from "@/components/layout/Sidebar";
import { useAuth } from "@/contexts/AuthContext";

const sections: SidebarSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", to: "/student/dashboard", icon: Compass, end: true },
      { label: "My Profile", to: "/student/profile", icon: User },
    ],
  },
  {
    title: "Career Tools",
    items: [
      { label: "Career Assessment", to: "/student/assessment", icon: ClipboardList },
      { label: "AI Recommendation", to: "/student/recommendation", icon: Sparkles },
      { label: "Career DNA Report", to: "/student/dna", icon: LineChart },
      { label: "Career Roadmap", to: "/student/roadmap", icon: Map },
      { label: "Skill Gap Analyzer", to: "/student/skill-gap", icon: Puzzle },
      { label: "Career Chat", to: "/student/chat", icon: MessageSquare },
      { label: "Resume Analyzer", to: "/student/resume-analyzer", icon: FileText },
      { label: "Career Comparison", to: "/student/compare", icon: Target },
    ],
  },
  {
    title: "Discover",
    items: [
      { label: "College Finder", to: "/student/colleges", icon: Building2 },
      { label: "Scholarship Finder", to: "/student/scholarships", icon: GraduationCap },
      { label: "Saved Careers", to: "/student/saved", icon: Heart },
    ],
  },
  {
    title: "Build & Learn",
    items: [
      { label: "Resume Builder", to: "/student/resume", icon: FileText },
      { label: "Learning Resources", to: "/student/resources", icon: BookOpen },
      { label: "Entrance Exams", to: "/student/exams", icon: ScrollText },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Notifications", to: "/student/notifications", icon: Bell },
      { label: "Settings", to: "/student/settings", icon: Settings },
      { label: "Help Center", to: "/student/help", icon: HelpCircle },
    ],
  },
];

function StudentLayout() {
  const { user } = useAuth();
  const education = [user?.studentClass || "Education not provided", user?.stream].filter(Boolean).join(" · ");

  return (
    <AppShell
      sections={sections}
      title="Student Dashboard"
      subtitle={`${user?.fullName || "Student"} · ${education}`}
      role="student"
    >
      <Outlet />
    </AppShell>
  );
}

export { StudentLayout };
