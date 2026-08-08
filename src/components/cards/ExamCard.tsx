import { CalendarClock, MonitorSmartphone, ScrollText, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { gradientFor } from "@/lib/icon-map";
import type { EntranceExam } from "@/types";

function ExamCard({ exam, className }: { exam: EntranceExam; className?: string }) {
  const modeTone = exam.mode === "Online" ? "secondary" : exam.mode === "Hybrid" ? "warning" : "muted";

  return (
    <Card className={cn("group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow", className)}>
      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-60", gradientFor(exam.color))} />
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-base font-bold leading-tight">{exam.name}</h3>
        <Badge variant={modeTone}>{exam.mode}</Badge>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">by {exam.conductingBody}</p>

      <div className="mt-4 space-y-2.5 text-sm">
        <p className="flex items-center gap-2 text-muted-foreground">
          <CalendarClock className="h-4 w-4 text-primary" />
          Exam: <span className="font-semibold text-foreground">{exam.examDate}</span>
        </p>
        <p className="flex items-center gap-2 text-muted-foreground">
          <ScrollText className="h-4 w-4 text-primary" />
          Registration closes: <span className="font-semibold text-foreground">{exam.registrationDeadline}</span>
        </p>
        <p className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4 text-primary" />
          Seats: <span className="font-semibold text-foreground">{exam.seats}</span>
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {exam.domains.map((d) => (
          <Badge key={d} variant="muted">{d}</Badge>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 border-t pt-4">
        <Button size="sm" className="flex-1">Apply Now</Button>
        <Button size="icon" variant="outline" className="shrink-0">
          <MonitorSmartphone className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

export { ExamCard };
