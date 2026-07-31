import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BrainCircuit, GraduationCap, IndianRupee, Sparkles, Target, TrendingUp, Users } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog } from "@/components/ui/dialog";
import { careers } from "@/data/careers";
import { getIcon, gradientFor } from "@/lib/icon-map";
import { cn } from "@/lib/utils";

function AiRecommendation() {
  const [selected, setSelected] = useState<string | null>(null);
  const recommended = careers.filter((c) => ["ai-ml-engineer", "fullstack-developer", "data-scientist", "cyber-security", "digital-marketer"].includes(c.id));
  const detail = careers.find((c) => c.id === selected);

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Career Recommendations"
        description="Your personalized matches — ranked by compatibility, with salary, demand and growth data."
        breadcrumbs={[{ label: "Dashboard", to: "/student/dashboard" }, { label: "AI Recommendation" }]}
        icon={BrainCircuit}
        actions={<Badge variant="accent"><Sparkles className="h-3 w-3" /> Updated 2 days ago</Badge>}
      />

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Why these careers?</span> Based on your assessment, we detected strong
            logical-reasoning and technical interests with a preference for high-growth roles. These 5 careers scored 80%+ compatibility.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recommended.map((c, i) => {
          const Icon = getIcon(c.icon);
          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card className="group h-full overflow-hidden transition-all hover:-translate-y-1 hover:shadow-glow">
                <div className={cn("h-1.5 w-full bg-gradient-to-r", gradientFor(c.color))} />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md", gradientFor(c.color))}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary">{c.domain}</Badge>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold">{c.title}</h3>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-muted/60 p-2"><IndianRupee className="mx-auto mb-0.5 h-3.5 w-3.5" /><span className="font-bold">{c.salary}</span></div>
                    <div className="rounded-lg bg-muted/60 p-2"><TrendingUp className="mx-auto mb-0.5 h-3.5 w-3.5" /><span className="font-bold">+{c.growth}%</span></div>
                    <div className="rounded-lg bg-muted/60 p-2"><Users className="mx-auto mb-0.5 h-3.5 w-3.5" /><span className="font-bold">{c.demand}</span></div>
                  </div>
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-xs"><span className="text-muted-foreground">Match</span><span className="font-bold text-primary">{c.match}%</span></div>
                    <Progress value={c.match ?? 0} />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => setSelected(c.id)}>Explore</Button>
                    <Link to="/student/compare" className="flex-1">
                      <Button size="sm" variant="outline" className="w-full">Compare</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setSelected(null)} title={detail?.title} description={`${detail?.domain} · ${detail?.salary}`}>
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-muted/60 p-3"><p className="text-[11px] text-muted-foreground">Demand</p><p className="text-sm font-bold">{detail.demand}</p></div>
              <div className="rounded-lg bg-muted/60 p-3"><p className="text-[11px] text-muted-foreground">Growth</p><p className="text-sm font-bold">+{detail.growth}%</p></div>
              <div className="rounded-lg bg-muted/60 p-3"><p className="text-[11px] text-muted-foreground">Fees</p><p className="text-sm font-bold">{detail.fees}</p></div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Required Skills</p>
              <div className="flex flex-wrap gap-1.5">{detail.skills.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}</div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Education Path</p>
              <div className="space-y-1.5">
                {detail.educationPath.map((e, i) => (
                  <p key={e} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{i + 1}</span>{e}
                  </p>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Future Scope</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{detail.futureScope}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button className="w-full"><Target className="h-4 w-4" /> Save Career</Button>
              <Button variant="outline" className="w-full"><GraduationCap className="h-4 w-4" /> View Roadmap</Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

export { AiRecommendation };
