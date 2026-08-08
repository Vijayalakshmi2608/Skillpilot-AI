import { toast } from "sonner";
import { motion } from "framer-motion";
import { Brain, Download, HeartPulse, Lightbulb, Shield, Sparkles, Target, Zap } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChartCard } from "@/components/charts/ChartCard";
import { RadarChartCard } from "@/components/charts/RadarChartCard";
import { CareerCard } from "@/components/cards/CareerCard";
import { careers } from "@/data/careers";

const radarData = [
  { subject: "Logic", value: 88 },
  { subject: "Creativity", value: 62 },
  { subject: "Leadership", value: 70 },
  { subject: "Analytical", value: 92 },
  { subject: "Communication", value: 75 },
  { subject: "Persistence", value: 84 },
];

const strengths = [
  { icon: Brain, title: "Analytical Thinker", desc: "You break complex problems into clear logical steps.", score: 92 },
  { icon: Zap, title: "Quick Learner", desc: "You pick up new tools and concepts fast.", score: 86 },
  { icon: Target, title: "Goal Oriented", desc: "You stay consistent once you commit to a goal.", score: 84 },
  { icon: HeartPulse, title: "Calm Under Pressure", desc: "Exams and deadlines bring out your best.", score: 78 },
];

const growth = [
  { icon: Lightbulb, title: "Public Speaking", desc: "Practice presenting to build confidence.", score: 55 },
  { icon: Shield, title: "Collaboration", desc: "Team up on projects to balance solo focus.", score: 60 },
];

function CareerDnaReport() {
  const top = careers.filter((c) => ["ai-ml-engineer", "fullstack-developer", "data-scientist"].includes(c.id));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Career DNA Report"
        description="A deep look at your personality, strengths and ideal career fit — generated from your assessment."
        breadcrumbs={[{ label: "Dashboard", to: "/student/dashboard" }, { label: "DNA Report" }]}
        icon={Sparkles}
        actions={
          <Button onClick={() => toast.success("Report downloaded!", { description: "PDF download is a UI-only demo." })}>
            <Download className="h-4 w-4" /> Download Report
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personality */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personality Analysis</CardTitle>
            <CardDescription>Your dominant traits from the assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="flex items-center gap-2 text-sm font-bold"><Sparkles className="h-4 w-4 text-primary" /> The "Analytical Builder"</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                You're a structured, logic-first thinker who thrives on systems and problem-solving. You prefer clear goals,
                measurable progress and technical challenges over ambiguity. Careers involving technology, data and engineering
                align strongly with your natural wiring.
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { l: "Learning Style", v: "Visual & Practical", c: "bg-blue-600" },
                { l: "Work Preference", v: "Deep Focus / Solo", c: "bg-indigo-600" },
                { l: "Decision Style", v: "Data-Driven", c: "bg-emerald-500" },
                { l: "Energy Source", v: "Problem Solving", c: "bg-amber-500" },
              ].map((i) => (
                <div key={i.l} className="rounded-xl border p-3">
                  <span className={`mb-2 block h-1.5 w-8 rounded-full ${i.c}`} />
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{i.l}</p>
                  <p className="text-sm font-semibold">{i.v}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Radar */}
        <ChartCard title="Career Fit Radar" description="How you score across 6 career-fit dimensions" action={<Badge variant="accent">Overall 78%</Badge>}>
          <div className="h-80">
            <RadarChartCard data={radarData} />
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Strengths</CardTitle>
            <CardDescription>Leverage these in your career choice</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {strengths.map((s) => (
              <div key={s.title} className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                  <s.icon className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <div className="flex justify-between"><p className="text-sm font-semibold">{s.title}</p><span className="text-sm font-bold text-primary">{s.score}%</span></div>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                  <Progress value={s.score} className="mt-1.5 h-1.5" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Areas to Grow</CardTitle>
              <CardDescription>Turn these into strengths with practice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {growth.map((s) => (
                <div key={s.title} className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between"><p className="text-sm font-semibold">{s.title}</p><span className="text-sm font-bold text-amber-500">{s.score}%</span></div>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                    <Progress value={s.score} className="mt-1.5 h-1.5" indicatorClassName="from-amber-500 to-orange-600" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-emerald-600 p-6 text-white">
              <p className="flex items-center gap-2 text-sm font-bold"><Brain className="h-4 w-4" /> What this means for you</p>
              <p className="mt-2 text-sm leading-relaxed text-white/85">
                Your profile best fits careers that reward analytical depth and continuous learning — tech, data, research and
                engineering. The recommended roadmaps will take you there step by step.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Top matches */}
      <div>
        <h2 className="mb-4 font-display text-xl font-bold">Top career matches from this report</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {top.map((c, i) => <CareerCard key={c.id} career={c} match className="h-full" index={i} />)}
        </div>
      </div>
    </div>
  );
}

export { CareerDnaReport };
