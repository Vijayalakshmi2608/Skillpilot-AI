import { useState } from "react";
import { toast } from "sonner";
import { Heart, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { CareerCard } from "@/components/cards/CareerCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { careers } from "@/data/careers";

function SavedCareers() {
  const [savedIds, setSavedIds] = useState<string[]>(["ai-ml-engineer", "data-scientist", "graphic-designer", "fullstack-developer"]);
  const saved = careers.filter((c) => savedIds.includes(c.id));

  const remove = (id: string) => {
    setSavedIds((ids) => ids.filter((i) => i !== id));
    toast.info("Removed from saved careers");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Saved Careers"
        description={`${saved.length} careers bookmarked for later — compare them or dive deeper.`}
        breadcrumbs={[{ label: "Dashboard", to: "/student/dashboard" }, { label: "Saved Careers" }]}
        icon={Heart}
      />
      {saved.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((c, i) => (
            <div key={c.id} className="group relative">
              <CareerCard career={c} match className="h-full" index={i} />
              <Button
                size="icon"
                variant="outline"
                className="absolute right-3 top-16 z-10 h-8 w-8 rounded-full bg-background/90 opacity-0 shadow transition-all group-hover:opacity-100 hover:border-destructive hover:text-destructive"
                onClick={() => remove(c.id)}
                aria-label={`Remove ${c.title}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title="No saved careers yet"
          description="Explore careers and hit the save button on the ones that interest you."
          action={<Button onClick={() => toast.info("Redirecting to explorer... (UI demo)")}>Browse Careers</Button>}
        />
      )}
    </div>
  );
}

export { SavedCareers };
