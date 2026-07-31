import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface SidebarItem {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
}

export interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

interface SidebarProps {
  sections: SidebarSection[];
  footer?: React.ReactNode;
  onNavigate?: () => void;
}

function Sidebar({ sections, footer, onNavigate }: SidebarProps) {
  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-4">
      {sections.map((section) => (
        <div key={section.title}>
          <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
            {section.title}
          </p>
          <nav className="space-y-1">
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      ))}
      {footer && <div className="mt-auto">{footer}</div>}
    </div>
  );
}

export { Sidebar };
