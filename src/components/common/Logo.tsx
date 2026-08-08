import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { cn } from "@/lib/utils";

function Logo({ className, to = "/", withText = true }: { className?: string; to?: string; withText?: boolean }) {
  return (
    <Link to={to} className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-500 text-white shadow-md transition-transform group-hover:scale-105">
        <Compass className="h-5 w-5" />
      </span>
      {withText && (
        <span className="font-display text-lg font-bold tracking-tight">
          Career<span className="text-gradient">Compass</span> AI
        </span>
      )}
    </Link>
  );
}

export { Logo };
