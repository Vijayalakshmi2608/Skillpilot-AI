import { ArrowUpRight, IndianRupee, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getIcon, gradientFor } from "@/lib/icon-map";
import type { Career } from "@/types";

interface CareerCardProps {
  career: Career;
  match?: boolean;
  className?: string;
  index?: number;
}

function CareerCard({ career, match, className, index = 0 }: CareerCardProps) {
  const Icon = getIcon(career.icon);
  const demandTone =
    career.demand === "Very High" || career.demand === "High" ? "success" : career.demand === "Growing" ? "warning" : "muted";

  return (
    <Card
      className={cn(
        "group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow",
        className
      )}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-70 transition-opacity group-hover:opacity-100",
          gradientFor(career.color)
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform group-hover:scale-110",
            gradientFor(career.color)
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <Badge variant="muted">{career.domain}</Badge>
      </div>

      <h3 className="mt-4 font-display text-lg font-bold">{career.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{career.description}</p>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-muted/60 p-2">
          <IndianRupee className="mx-auto mb-1 h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-xs font-bold">{career.salary}</p>
        </div>
        <div className="rounded-lg bg-muted/60 p-2">
          <TrendingUp className="mx-auto mb-1 h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-xs font-bold">+{career.growth}%</p>
        </div>
        <div className="rounded-lg bg-muted/60 p-2">
          <Users className="mx-auto mb-1 h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-xs font-bold">{career.demand}</p>
        </div>
      </div>

      {match && career.match !== undefined && (
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Career Match</span>
            <span className="font-bold text-primary">{career.match}%</span>
          </div>
          <Progress value={career.match} />
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t pt-3">
        <span className="text-xs text-muted-foreground">{career.skills.slice(0, 2).join(" · ")}</span>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
      </div>
    </Card>
  );
}

export { CareerCard };
