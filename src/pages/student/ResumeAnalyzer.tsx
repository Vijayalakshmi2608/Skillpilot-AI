import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

type ResumeAnalysis = {
  resumeScore: number;
  strengths: string[];
  weaknesses: string[];
  missingSections: string[];
  missingSkills: string[];
  atsImprovementSuggestions: string[];
  betterProjectDescriptions: string[];
  betterSummary: string;
  betterSkillsSection: string;
  recommendedCertifications: string[];
  resumeImprovementPlan: string[];
};

function ResumeAnalyzer() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [form, setForm] = useState({
    student_name: "Student",
    career_goal: "Software Engineer",
    resume_text: "Experienced developer with skills in Python and JavaScript. Built several web applications using React and Node.js. Interned at a tech startup where I contributed to backend APIs.",
    skills: ["Python", "JavaScript", "React", "Node.js"],
    projects: ["E-commerce website", "Task manager app"],
    certifications: ["AWS Certified Developer"],
    education: "B.Tech in Computer Science",
    internships: ["Software intern at TechCorp"],
  });

  const update = (field: string, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const analyze = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in first.");
      return;
    }
    setLoading(true);
    try {
      const data = await api.post<{ success: boolean; data: { resumeAnalysis: ResumeAnalysis } }>("/ai/resume-analyzer", {
        student_name: form.student_name,
        career_goal: form.career_goal,
        resume_text: form.resume_text,
        skills: form.skills,
        projects: form.projects,
        certifications: form.certifications,
        education: form.education,
        internships: form.internships,
      });
      setAnalysis(data.data.resumeAnalysis);
      toast.success("Resume analyzed successfully!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to analyze resume";
      toast.error("Analysis failed", { description: message });
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = analysis
    ? analysis.resumeScore >= 80
      ? "from-emerald-500 to-teal-600"
      : analysis.resumeScore >= 60
        ? "from-amber-500 to-orange-600"
        : "from-rose-500 to-pink-600"
    : "from-blue-600 to-indigo-600";

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Resume Analyzer"
        description="Get professional feedback on your resume structure, ATS compatibility, and improvement suggestions."
        breadcrumbs={[{ label: "Dashboard", to: "/student/dashboard" }, { label: "Resume Analyzer" }]}
        icon={FileText}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Student Name</Label>
              <Input value={form.student_name} onChange={(e) => update("student_name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Career Goal</Label>
              <Input value={form.career_goal} onChange={(e) => update("career_goal", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Education</Label>
              <Input value={form.education} onChange={(e) => update("education", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Skills (comma-separated)</Label>
              <Input value={form.skills.join(", ")} onChange={(e) => update("skills", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
            </div>
            <div className="space-y-1.5">
              <Label>Projects (comma-separated)</Label>
              <Input value={form.projects.join(", ")} onChange={(e) => update("projects", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
            </div>
            <div className="space-y-1.5">
              <Label>Certifications (comma-separated)</Label>
              <Input value={form.certifications.join(", ")} onChange={(e) => update("certifications", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
            </div>
            <div className="space-y-1.5">
              <Label>Internships (comma-separated)</Label>
              <Input value={form.internships.join(", ")} onChange={(e) => update("internships", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
            </div>
            <div className="space-y-1.5">
              <Label>Resume Text</Label>
              <Textarea rows={6} value={form.resume_text} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => update("resume_text", e.target.value)} />
            </div>
            <Button onClick={analyze} disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              {loading ? "Analyzing..." : "Analyze Resume"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {analysis && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={cn("flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg", scoreColor)}>
                    <span className="text-2xl font-bold">{analysis.resumeScore}</span>
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold">Resume Score</h3>
                    <p className="text-sm text-muted-foreground">
                      {analysis.resumeScore >= 80 ? "Excellent" : analysis.resumeScore >= 60 ? "Good, but needs improvement" : "Needs significant improvement"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Strengths</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {analysis.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Weaknesses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {analysis.weaknesses.map((s, i) => <li key={i}>• {s}</li>)}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Missing Skills & Sections</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {analysis.missingSkills.map((s) => <Badge key={s} variant="destructive">{s}</Badge>)}
                  {analysis.missingSections.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">ATS Improvement Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {analysis.atsImprovementSuggestions.map((s, i) => <li key={i}>• {s}</li>)}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Better Summary & Skills Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>{analysis.betterSummary}</p>
                  <p className="rounded-xl bg-muted/50 p-3">{analysis.betterSkillsSection}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Better Project Descriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {analysis.betterProjectDescriptions.map((d, i) => <li key={i}>• {d}</li>)}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recommended Certifications</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {analysis.recommendedCertifications.map((c) => <Badge key={c} variant="success">{c}</Badge>)}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Resume Improvement Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    {analysis.resumeImprovementPlan.map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export { ResumeAnalyzer };
