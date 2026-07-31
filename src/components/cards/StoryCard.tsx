import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { SuccessStory } from "@/types";

function StoryCard({ story, className }: { story: SuccessStory; className?: string }) {
  return (
    <Card className={cn("relative p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow", className)}>
      <Quote className="absolute right-5 top-5 h-8 w-8 text-primary/10" />
      <Badge variant="secondary">{story.domain}</Badge>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">"{story.quote}"</p>
      <div className="mt-5 border-t pt-4">
        <p className="font-display text-sm font-bold">{story.achievement}</p>
        <div className="mt-3 flex items-center gap-3">
          <Avatar initials={story.initials} color={story.color} size="sm" />
          <div>
            <p className="text-sm font-semibold">{story.name}</p>
            <p className="text-xs text-muted-foreground">Class of {story.year}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export { StoryCard };
