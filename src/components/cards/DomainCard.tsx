import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { getIcon, gradientFor } from "@/lib/icon-map";
import type { CareerDomain } from "@/types";

function DomainCard({ domain, className }: { domain: CareerDomain; className?: string }) {
  const Icon = getIcon(domain.icon);
  return (
    <Card className={cn("group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow", className)}>
      <div
        className={cn(
          "absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br opacity-10 blur-2xl transition-opacity group-hover:opacity-25",
          gradientFor(domain.color)
        )}
      />
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform group-hover:scale-110",
            gradientFor(domain.color)
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
      <h3 className="mt-4 font-display text-base font-bold">{domain.name}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{domain.tagline}</p>
      <p className="mt-3 text-xs font-semibold text-primary">{domain.careers} careers</p>
    </Card>
  );
}

export { DomainCard };
