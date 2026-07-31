import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  delta?: number;
  hint?: string;
  gradient?: string;
  className?: string;
  index?: number;
}

const gradients: Record<string, string> = {
  blue: "from-blue-600 to-indigo-600",
  emerald: "from-emerald-500 to-teal-600",
  amber: "from-amber-500 to-orange-600",
  violet: "from-violet-500 to-purple-600",
  rose: "from-rose-500 to-pink-600",
  sky: "from-sky-500 to-cyan-600",
};

function StatCard({ title, value, icon: Icon, delta, hint, gradient = "blue", className, index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Card className={cn("group relative overflow-hidden p-5", className)}>
        <div
          className={cn(
            "absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-10 blur-xl transition-opacity group-hover:opacity-20",
            gradients[gradient] ?? gradients.blue
          )}
        />
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md",
              gradients[gradient] ?? gradients.blue
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          {delta !== undefined && (
            <Badge variant={delta >= 0 ? "success" : "destructive"} className="gap-0.5">
              {delta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {delta >= 0 ? "+" : ""}
              {delta}%
            </Badge>
          )}
        </div>
        <div className="mt-4">
          <p className="font-display text-2xl font-bold tracking-tight">{value}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{title}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground/70">{hint}</p>}
        </div>
      </Card>
    </motion.div>
  );
}

export { StatCard };
