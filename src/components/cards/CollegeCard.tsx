import { Building2, IndianRupee, MapPin, Medal, Percent, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/common/RatingStars";
import type { College } from "@/types";

function CollegeCard({ college, className }: { college: College; className?: string }) {
  const typeTone =
    college.type === "IIT" || college.type === "NIT"
      ? "secondary"
      : college.type === "Government"
        ? "success"
        : college.type === "Deemed"
          ? "warning"
          : "muted";

  return (
    <Card className={cn("group p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold leading-tight">{college.name}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> {college.district}, {college.state}
            </p>
          </div>
        </div>
        <Badge variant={typeTone}>{college.type}</Badge>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {college.courses.slice(0, 3).map((c) => (
          <Badge key={c} variant="muted">{c}</Badge>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2 rounded-lg bg-muted/60 p-2.5">
          <Percent className="h-4 w-4 text-primary" />
          <div>
            <p className="text-[11px] text-muted-foreground">Cutoff</p>
            <p className="text-xs font-bold">{college.cutoff}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-muted/60 p-2.5">
          <IndianRupee className="h-4 w-4 text-accent" />
          <div>
            <p className="text-[11px] text-muted-foreground">Fees</p>
            <p className="text-xs font-bold">{college.fees}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-muted/60 p-2.5">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          <div>
            <p className="text-[11px] text-muted-foreground">Placement</p>
            <p className="text-xs font-bold">{college.placement}% · {college.avgPackage}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-muted/60 p-2.5">
          <Medal className="h-4 w-4 text-amber-500" />
          <div>
            <p className="text-[11px] text-muted-foreground">Ranking</p>
            <p className="text-xs font-bold">#{college.ranking}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t pt-3">
        <RatingStars rating={college.rating} />
        <Badge variant={college.hostel ? "accent" : "outline"}>{college.hostel ? "Hostel Available" : "No Hostel"}</Badge>
      </div>
    </Card>
  );
}

export { CollegeCard };
