import { Outlet } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import {
  BarChart3,
  Building2,
  FileBarChart,
  GraduationCap,
  Landmark,
  LayoutDashboard,
  Library,
  Newspaper,
  ScrollText,
  Settings,
  Shapes,
  Users,
  BookMarked,
  Bell,
} from "lucide-react";
import type { SidebarSection } from "@/components/layout/Sidebar";

const sections: SidebarSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true },
      { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
      { label: "Reports", to: "/admin/reports", icon: FileBarChart },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Students", to: "/admin/students", icon: Users },
      { label: "Careers", to: "/admin/careers", icon: BookMarked },
      { label: "Career Domains", to: "/admin/domains", icon: Shapes },
      { label: "Colleges", to: "/admin/colleges", icon: Building2 },
      { label: "Scholarships", to: "/admin/scholarships", icon: Landmark },
      { label: "Entrance Exams", to: "/admin/exams", icon: ScrollText },
      { label: "Resources", to: "/admin/resources", icon: Library },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Notifications", to: "/admin/notifications", icon: Bell },
      { label: "Settings", to: "/admin/settings", icon: Settings },
    ],
  },
];

function AdminLayout() {
  return (
    <AppShell
      sections={sections}
      title="Admin Console"
      subtitle="Career Compass AI · Control Center"
      role="admin"
    >
      <Outlet />
    </AppShell>
  );
}

export { AdminLayout };
