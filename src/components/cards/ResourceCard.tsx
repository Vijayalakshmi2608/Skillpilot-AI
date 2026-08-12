import { BookOpen, Clock, GraduationCap, PlayCircle, FileText, ListChecks, BookMarked } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/common/RatingStars";
import type { Resource } from "@/types";

const typeIcon = {
  Video: PlayCircle,
  Article: FileText,
  Course: GraduationCap,
  Book: BookOpen,
  Quiz: ListChecks,
  PDF: FileText,
};

function ResourceCard({ resource, className }: { resource: Resource; className?: string }) {
  const Icon = typeIcon[resource.type] ?? BookMarked;
  const levelTone =
    resource.level === "Beginner" ? "success" : resource.level === "Intermediate" ? "warning" : "destructive";

  return (
    <Card className={cn("group p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md transition-transform group-hover:scale-110">
          <Icon className="h-5 w-5" />
        </div>
        <Badge variant="muted">{resource.type}</Badge>
      </div>
      <h3 className="mt-4 line-clamp-2 font-display text-base font-bold">{resource.title}</h3>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" /> {resource.duration} · {resource.provider}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <Badge variant={levelTone}>{resource.level}</Badge>
        <RatingStars rating={resource.rating} />
      </div>
    </Card>
  );
}

export { ResourceCard };
