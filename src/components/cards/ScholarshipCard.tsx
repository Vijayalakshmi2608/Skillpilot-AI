import { CalendarDays, CheckCircle2, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Scholarship } from "@/types";

function ScholarshipCard({ scholarship, className }: { scholarship: Scholarship; className?: string }) {
  return (
    <Card className={cn("group flex flex-col p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
          <IndianRupee className="h-5 w-5" />
        </div>
        <Badge variant="accent">{scholarship.amount}</Badge>
      </div>

      <h3 className="mt-4 font-display text-base font-bold">{scholarship.name}</h3>
      <p className="mt-0.5 text-xs font-medium text-muted-foreground">by {scholarship.provider}</p>

      <div className="mt-4 space-y-2">
        {scholarship.eligibility.slice(0, 3).map((e) => (
          <p key={e} className="flex items-start gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
            {e}
          </p>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" /> Deadline
        </span>
        <span className="text-xs font-bold">{scholarship.deadline}</span>
      </div>

      <Button size="sm" variant="outline" className="mt-4 w-full transition-all group-hover:border-primary group-hover:text-primary">
        Apply Now
      </Button>
    </Card>
  );
}

export { ScholarshipCard };
