import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Award, BookOpen, CalendarClock, Puzzle } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { careers } from "@/data/careers";

function SkillGapAnalyzer() {
  const [careerId, setCareerId] = useState("ai-ml-engineer");
  const career = useMemo(() => careers.find((c) => c.id === careerId) ?? careers[0], [careerId]);

  const currentSkills = ["Python (Basic)", "Mathematics", "English", "Logical Reasoning"];
  const requiredSkills = career.skills;

  const gapData = requiredSkills.map((skill) => {
    const has = currentSkills.some((c) => skill.toLowerCase().includes(c.split(" ")[0].toLowerCase()) || c.toLowerCase().includes(skill.toLowerCase().split(" ")[0]));
    return { skill, level: has ? 65 + Math.floor(Math.random() * 30) : 15 + Math.floor(Math.random() * 30), gap: !has };
  });

  const recommendedCourses = [
    { title: "Python for Data Science", provider: "Coursera", duration: "24 hrs", level: "Beginner" },
    { title: "Machine Learning A-Z", provider: "Udemy", duration: "44 hrs", level: "Intermediate" },
    { title: "Statistics & Probability", provider: "Khan Academy", duration: "18 hrs", level: "Beginner" },
    { title: "Deep Learning Specialization", provider: "Coursera", duration: "60 hrs", level: "Advanced" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skill Gap Analyzer"
        description="Compare your current skills against what your dream career requires — then close the gap."
        breadcrumbs={[{ label: "Dashboard", to: "/student/dashboard" }, { label: "Skill Gap Analyzer" }]}
        icon={Puzzle}
        actions={
          <Select value={careerId} onChange={(e) => setCareerId(e.target.value)} className="w-64" aria-label="Target career">
            {careers.slice(0, 12).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </Select>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gap bars */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Skills required for {career.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {gapData.map((g) => (
              <div key={g.skill}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{g.skill}</span>
                  <Badge variant={g.gap ? "destructive" : "success"}>{g.gap ? "Gap" : "On track"}</Badge>
                </div>
                <Progress value={g.level} indicatorClassName={g.gap ? "from-rose-500 to-pink-600" : "from-emerald-500 to-teal-600"} />
              </div>
            ))}
            <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Overall readiness: </span>
              {Math.round(gapData.filter((g) => !g.gap).length / gapData.length * 100)}% — you're {gapData.filter((g) => !g.gap).length} of {gapData.length} core skills away from {career.title}.
            </div>
          </CardContent>
        </Card>

        {/* Recommended courses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recommended courses to close the gap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendedCourses.map((c, i) => (
              <motion.div key={c.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <div className="flex items-center gap-3 rounded-xl border p-3.5 transition-colors hover:border-primary/40">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                    <BookOpen className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.provider} · {c.duration}</p>
                  </div>
                  <Badge variant="muted">{c.level}</Badge>
                </div>
              </motion.div>
            ))}
            <Button variant="outline" className="w-full"><ArrowRight className="h-4 w-4" /> View all courses in Resources</Button>
          </CardContent>
        </Card>
      </div>

      {/* Learning timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><CalendarClock className="h-4 w-4 text-primary" /> Suggested learning timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { m: "Month 1-2", t: "Python + basics", d: "Syntax, functions, OOP — 2 hrs/day" },
              { m: "Month 3-4", t: "Maths for ML", d: "Statistics, linear algebra essentials" },
              { m: "Month 5-6", t: "First ML models", d: "scikit-learn, regression & classification" },
              { m: "Month 7+", t: "Deep learning", d: "TensorFlow/PyTorch + 2 portfolio projects" },
            ].map((s, i) => (
              <div key={s.m} className="relative rounded-xl border p-4">
                <span className="absolute -top-2 left-4 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">{s.m}</span>
                <Award className="h-5 w-5 text-primary" />
                <p className="mt-2 text-sm font-bold">{s.t}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { SkillGapAnalyzer };
