import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Award, BookOpen, CalendarClock, Puzzle, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { careers } from "@/data/careers";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

type SkillGapAnalysis = {
  requiredSkills: string[];
  missingSkills: string[];
  skillGapPercentage: number;
  learningPriority: string[];
  recommendedTechnologies: string[];
  learningPath: string[];
  courses: Array<{ name: string; platform: string; duration: string }>;
  certifications: Array<{ name: string; provider?: string }>;
  projects: Array<{ name: string; difficulty?: string }>;
  practicePlatforms: string[];
  books: string[];
  interviewPreparation: string[];
  estimatedCompletionTime: string;
  weeklyLearningPlan: string[];
  monthlyLearningPlan: string[];
  expectedOutcome: string;
};

function SkillGapAnalyzer() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [careerId, setCareerId] = useState("ai-ml-engineer");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [currentSkills, setCurrentSkills] = useState("Python (Basic), Mathematics, English, Logical Reasoning");
  const [technicalSkills, setTechnicalSkills] = useState("Python, SQL");
  const [softSkills, setSoftSkills] = useState("Teamwork, Communication");
  const [projects, setProjects] = useState("Sales dashboard, Personal website");
  const [certifications, setCertifications] = useState("Google Data Analytics");
  const [education, setEducation] = useState("B.Tech in Computer Science");
  const [experience, setExperience] = useState("1 year internship at a startup");

  const career = useMemo(() => careers.find((c) => c.id === careerId) ?? careers[0], [careerId]);

  const analyze = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in first.");
      return;
    }
    setLoading(true);
    try {
      const data = await api.post<{ success: boolean; data: { skillGapAnalysis: SkillGapAnalysis } }>("/ai/skill-gap", {
        student_name: "Student",
        selected_career: career.title,
        current_skills: currentSkills.split(",").map((s) => s.trim()).filter(Boolean),
        technical_skills: technicalSkills.split(",").map((s) => s.trim()).filter(Boolean),
        soft_skills: softSkills.split(",").map((s) => s.trim()).filter(Boolean),
        projects: projects.split(",").map((s) => s.trim()).filter(Boolean),
        certifications: certifications.split(",").map((s) => s.trim()).filter(Boolean),
        education,
        experience,
      });
      setAnalysis(data.data.skillGapAnalysis);
      toast.success("Skill gap analysis generated!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to analyze skill gap";
      toast.error("Analysis failed", { description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Skill Gap Analyzer"
        description="Compare your current skills against industry requirements and get a personalised learning plan."
        breadcrumbs={[{ label: "Dashboard", to: "/student/dashboard" }, { label: "Skill Gap Analyzer" }]}
        icon={Puzzle}
        actions={
          <Select value={careerId} onChange={(e) => setCareerId(e.target.value)} className="w-64" aria-label="Target career">
            {careers.slice(0, 12).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </Select>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Current Skills (comma-separated)</Label>
            <Input value={currentSkills} onChange={(e) => setCurrentSkills(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Technical Skills</Label>
            <Input value={technicalSkills} onChange={(e) => setTechnicalSkills(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Soft Skills</Label>
            <Input value={softSkills} onChange={(e) => setSoftSkills(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Projects</Label>
            <Input value={projects} onChange={(e) => setProjects(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Certifications</Label>
            <Input value={certifications} onChange={(e) => setCertifications(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Education</Label>
            <Input value={education} onChange={(e) => setEducation(e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
            <Label>Experience</Label>
            <Input value={experience} onChange={(e) => setExperience(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Button onClick={analyze} disabled={loading} className="w-full sm:w-auto">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Puzzle className="h-4 w-4" />}
        {loading ? "Analyzing..." : "Analyze Skill Gap"}
      </Button>

      {analysis && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Skill Gap Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">Skill Gap Percentage</span>
                  <Badge variant={analysis.skillGapPercentage > 50 ? "destructive" : "success"}>{analysis.skillGapPercentage}%</Badge>
                </div>
                <Progress value={100 - analysis.skillGapPercentage} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Missing Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.missingSkills.map((s) => <Badge key={s} variant="destructive">{s}</Badge>)}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Learning Priority</p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.learningPriority.map((s, i) => <Badge key={s} variant="secondary">{i + 1}. {s}</Badge>)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recommended Technologies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.recommendedTechnologies.map((t) => (
                  <div key={t} className="flex items-center justify-between rounded-xl border p-3 text-sm">
                    <span className="font-medium">{t}</span>
                    <Badge variant="muted">Learn</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Learning Path</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm text-muted-foreground">
                {analysis.learningPath.map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Courses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.courses.map((c, i) => (
                  <motion.div key={c.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <div className="flex items-center gap-3 rounded-xl border p-3.5 transition-colors hover:border-primary/40">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                        <BookOpen className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.platform} · {c.duration}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Practice Platforms & Books</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Platforms</p>
                  {analysis.practicePlatforms.map((p) => <Badge key={p} variant="secondary">{p}</Badge>)}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Books</p>
                  {analysis.books.map((b) => <Badge key={b} variant="outline">{b}</Badge>)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Certifications & Projects</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Certifications</p>
                {analysis.certifications.map((c) => <Badge key={c.name} variant="success">{c.name}</Badge>)}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Projects</p>
                {analysis.projects.map((p) => <Badge key={p.name} variant="accent">{p.name}</Badge>)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><CalendarClock className="h-4 w-4 text-primary" /> Learning Plans</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Weekly Plan</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {analysis.weeklyLearningPlan.map((w, i) => <li key={i}>• {w}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Monthly Plan</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {analysis.monthlyLearningPlan.map((m, i) => <li key={i}>• {m}</li>)}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-2">
              <h3 className="font-display text-base font-bold">Interview Preparation</h3>
              <p className="text-sm text-muted-foreground">{analysis.interviewPreparation.join(" | ")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-2">
              <h3 className="font-display text-base font-bold">Expected Outcome</h3>
              <p className="text-sm text-muted-foreground">{analysis.expectedOutcome}</p>
              <p className="text-sm text-muted-foreground">Estimated completion: {analysis.estimatedCompletionTime}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

export { SkillGapAnalyzer };
