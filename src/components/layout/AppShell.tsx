import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { DropdownMenu, DropdownItem } from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Logo } from "@/components/common/Logo";
import { Sidebar, type SidebarSection } from "@/components/layout/Sidebar";
import { useAuth } from "@/contexts/AuthContext";

interface AppShellProps {
  sections: SidebarSection[];
  title: string;
  subtitle?: string;
  role: "student" | "admin";
  notificationsTo?: string;
  profileTo?: string;
  children: React.ReactNode;
}

function AppShell({ sections, title, subtitle, role, notificationsTo, profileTo, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const notificationsHref = notificationsTo ?? (role === "student" ? "/student/notifications" : "/admin/notifications");
  const profileHref = profileTo ?? (role === "student" ? "/student/profile" : "/admin/settings");
  const logoutTo = role === "student" ? "/login" : "/admin/login";
  const homeTo = role === "student" ? "/student/dashboard" : "/admin";
  const displayName = role === "student" ? user?.fullName || "Student" : "Admin";
  const education = role === "student"
    ? [user?.studentClass || "Education not provided", user?.stream].filter(Boolean).join(" · ")
    : "Administrator";
  const initials = displayName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate(logoutTo, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border/60 bg-card/50 backdrop-blur-xl lg:block">
        <div className="flex h-16 items-center border-b border-border/60 px-5">
          <Logo to={homeTo} />
        </div>
        <Sidebar sections={sections} />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-background lg:hidden"
            >
              <div className="flex h-16 items-center justify-between border-b px-5">
                <Logo to={homeTo} />
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Sidebar sections={sections} onNavigate={() => setSidebarOpen(false)} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden min-w-0 md:block">
            <p className="truncate font-display text-base font-bold">{title}</p>
            {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden w-56 sm:block lg:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search careers, colleges..."
                className="h-9 pl-9"
              />
            </div>

            <ThemeToggle />

            <Link to={notificationsHref}>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
              </Button>
            </Link>

            <DropdownMenu
              trigger={
                <button className="flex items-center gap-2 rounded-full p-0.5 transition-colors hover:bg-muted">
                  <Avatar initials={role === "student" ? initials : "AD"} color="bg-gradient-to-br from-blue-600 to-indigo-600" />
                  <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
                </button>
              }
            >
              {(close) => (
                <>
                  <div className="border-b px-3 py-2">
                    <p className="text-sm font-semibold">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{education}</p>
                  </div>
                  <div className="pt-1">
                    <DropdownItem onClick={close}>
                      <Link to={profileHref} className="flex w-full items-center gap-2">
                        <User className="h-4 w-4" /> Profile
                      </Link>
                    </DropdownItem>
                    <DropdownItem onClick={close}>
                      <Link to={homeTo} className="flex w-full items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Link>
                    </DropdownItem>
                    <DropdownItem onClick={close}>
                      <Link to="/student/settings" className="flex w-full items-center gap-2">
                        <Settings className="h-4 w-4" /> Settings
                      </Link>
                    </DropdownItem>
                    <DropdownItem onClick={() => { close(); handleLogout(); }} className="text-destructive">
                      <LogOut className="h-4 w-4" /> Logout
                    </DropdownItem>
                  </div>
                </>
              )}
            </DropdownMenu>
          </div>
        </header>

        <main key={location.pathname} className="animate-fade-in p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export { AppShell };
