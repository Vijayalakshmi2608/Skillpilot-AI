import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Award, BookOpen, Briefcase, Code2, Flag, GraduationCap, Rocket, Target, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

type RoadmapData = {
  entranceExams: Array<{ name: string; eligibility: string; prepTips: string }>;
  degreeSelection: Array<{ degree: string; reason: string }>;
  semesterWiseLearning: Array<{ semester: string; focus: string }>;
  certifications: Array<{ name: string; timeline: string }>;
  projects: Array<{ name: string; difficulty: string }>;
  internships: Array<{ company: string; type: string }>;
  hackathons: Array<{ name: string; type: string }>;
  portfolio: Array<{ item: string }>;
  resumePreparation: string[];
  placementPreparation: string[];
  interviewPreparation: string[];
  higherStudies: Array<{ option: string; benefit: string }>;
  estimatedTimeline: string;
  monthlyGoals: string[];
  yearlyGoals: string[];
  freeResources: string[];
  paidResources: string[];
  tips: string[];
};

const emptyRoadmap: RoadmapData = {
  entranceExams: [],
  degreeSelection: [],
  semesterWiseLearning: [],
  certifications: [],
  projects: [],
  internships: [],
  hackathons: [],
  portfolio: [],
  resumePreparation: [],
  placementPreparation: [],
  interviewPreparation: [],
  higherStudies: [],
  estimatedTimeline: "",
  monthlyGoals: [],
  yearlyGoals: [],
  freeResources: [],
  paidResources: [],
  tips: [],
};

function isRoadmapData(value: unknown): value is RoadmapData {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<RoadmapData>;
  return typeof candidate.estimatedTimeline === "string"
    && Array.isArray(candidate.entranceExams)
    && Array.isArray(candidate.degreeSelection)
    && Array.isArray(candidate.projects)
    && Array.isArray(candidate.tips);
}

function CareerRoadmap() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [roadmap, setRoadmap] = useState<RoadmapData>(emptyRoadmap);
  const [loading, setLoading] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState("");
  const [currentSkills, setCurrentSkills] = useState("");
  const [currentEducation, setCurrentEducation] = useState("");
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [savedRoadmapId, setSavedRoadmapId] = useState<number | null>(null);
  const [savedRoadmapsLoading, setSavedRoadmapsLoading] = useState(true);

  const canGenerate = useMemo(() => selectedCareer && currentEducation && careerGoal, [selectedCareer, currentEducation, careerGoal]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Please log in to generate a roadmap.");
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (!user) return;
    setCurrentEducation((value) => value || user.studentClass || user.stream || "");
    setCurrentSkills((value) => value || user.stream || "");
    setLocation((value) => value || user.city || "");
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    api.get<{ success: boolean; data: Array<{ id: number; title: string; milestones: unknown }> }>("/students/me/roadmaps")
      .then(({ data }) => {
        const latest = data[0];
        if (!active || !latest || !isRoadmapData(latest.milestones)) return;
        setRoadmap(latest.milestones);
        setSelectedCareer(latest.title);
        setSavedRoadmapId(latest.id);
      })
      .catch((error: unknown) => {
        if (active) {
          toast.error("Unable to load saved roadmaps", {
            description: error instanceof Error ? error.message : "Please try again.",
          });
        }
      })
      .finally(() => {
        if (active) setSavedRoadmapsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const generateRoadmap = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in first.");
      return;
    }
    setLoading(true);
    try {
      const data = await api.post<{ success: boolean; data: { roadmap: RoadmapData } }>("/ai/roadmap", {
        name: user?.fullName || "Student",
        selectedCareer,
        currentSkills: currentSkills.split(",").map((s) => s.trim()).filter(Boolean),
        currentEducation,
        budget,
        location,
        careerGoal,
      });
      setRoadmap(data.data.roadmap);
      let roadmapSaved = false;
      try {
        const saved = await api.post<{ success: boolean; data: { id: number } }>("/students/me/roadmaps", {
          careerTitle: selectedCareer.trim(),
          milestones: data.data.roadmap,
        });
        setSavedRoadmapId(saved.data.id);
        roadmapSaved = true;
      } catch (saveError) {
        const saveMessage = saveError instanceof Error ? saveError.message : "The generated roadmap could not be saved.";
        toast.warning("Roadmap generated but not saved", { description: saveMessage });
      }
      toast.success(roadmapSaved ? "AI roadmap generated and saved." : "AI roadmap generated.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate roadmap";
      toast.error("Roadmap generation failed", { description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Career Roadmap"
        description="Get a personalised step-by-step plan from Class 12 to your dream career."
        breadcrumbs={[{ label: "Dashboard", to: "/student/dashboard" }, { label: "Career Roadmap" }]}
        icon={Flag}
      />

      <Card>
        <CardContent className="p-5 space-y-4">
          {savedRoadmapsLoading && <p className="text-xs text-muted-foreground">Checking for saved roadmaps...</p>}
          {savedRoadmapId !== null && !savedRoadmapsLoading && (
            <p className="text-xs text-emerald-700">This roadmap is saved to your account and will be available after you return.</p>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Selected Career</Label>
              <Input value={selectedCareer} onChange={(e) => setSelectedCareer(e.target.value)} placeholder="e.g. AI/ML Engineer" />
            </div>
            <div className="space-y-1.5">
              <Label>Current Education</Label>
              <Input value={currentEducation} onChange={(e) => setCurrentEducation(e.target.value)} placeholder="e.g. Class 12" />
            </div>
            <div className="space-y-1.5">
              <Label>Career Goal</Label>
              <Input value={careerGoal} onChange={(e) => setCareerGoal(e.target.value)} placeholder="e.g. Become an AI/ML Engineer" />
            </div>
            <div className="space-y-1.5">
              <Label>Current Skills (comma-separated)</Label>
              <Input value={currentSkills} onChange={(e) => setCurrentSkills(e.target.value)} placeholder="Python, Maths..." />
            </div>
            <div className="space-y-1.5">
              <Label>Budget</Label>
              <Input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="₹10 lakhs" />
            </div>
            <div className="space-y-1.5">
              <Label>Preferred Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Bangalore" />
            </div>
          </div>
          <Button onClick={generateRoadmap} disabled={!canGenerate || loading} className="w-full sm:w-auto">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />}
            {loading ? "Generating..." : "Generate Roadmap"}
          </Button>
        </CardContent>
      </Card>

      {roadmap.estimatedTimeline && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card>
            <CardContent className="p-5">
              <h3 className="font-display text-lg font-bold">Estimated Timeline</h3>
              <p className="text-sm text-muted-foreground">{roadmap.estimatedTimeline}</p>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardContent className="p-5 space-y-3">
                <h3 className="font-display text-base font-bold">Degree Selection</h3>
                {roadmap.degreeSelection.map((d, i) => (
                  <div key={i} className="rounded-xl bg-muted/50 p-3 text-sm">
                    <p className="font-semibold">{d.degree}</p>
                    <p className="text-xs text-muted-foreground">{d.reason}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 space-y-3">
                <h3 className="font-display text-base font-bold">Entrance Exams</h3>
                {roadmap.entranceExams.map((e, i) => (
                  <div key={i} className="rounded-xl bg-muted/50 p-3 text-sm">
                    <p className="font-semibold">{e.name}</p>
                    <p className="text-xs text-muted-foreground">Eligibility: {e.eligibility}</p>
                    <p className="text-xs text-muted-foreground">Tip: {e.prepTips}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-display text-base font-bold">Yearly Goals</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {roadmap.yearlyGoals.map((g, i) => (
                  <div key={i} className="rounded-xl border p-3 text-sm">
                    <span className="text-[10px] font-bold text-primary">YEAR {i + 1}</span>
                    <p className="mt-1 font-medium">{g}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-display text-base font-bold">Monthly Goals</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {roadmap.monthlyGoals.map((g, i) => (
                  <div key={i} className="rounded-xl border p-3 text-sm">
                    <span className="text-[10px] font-bold text-primary">MONTH {i + 1}</span>
                    <p className="mt-1 font-medium">{g}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardContent className="p-5 space-y-3">
                <h3 className="font-display text-base font-bold">Certifications</h3>
                {roadmap.certifications.map((c, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl bg-muted/50 p-3 text-sm">
                    <span className="font-medium">{c.name}</span>
                    <Badge variant="muted">{c.timeline}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 space-y-3">
                <h3 className="font-display text-base font-bold">Projects</h3>
                {roadmap.projects.map((p, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl bg-muted/50 p-3 text-sm">
                    <span className="font-medium">{p.name}</span>
                    <Badge variant="secondary">{p.difficulty}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-display text-base font-bold">Internships</h3>
              {roadmap.internships.map((item, i) => (
                <div key={i} className="rounded-xl bg-muted/50 p-3 text-sm">
                  <p className="font-semibold">{item.company}</p>
                  <p className="text-xs text-muted-foreground">{item.type}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-display text-base font-bold">Hackathons & Portfolio</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Hackathons</p>
                  {roadmap.hackathons.map((h, i) => (
                    <p key={i} className="text-sm text-muted-foreground">• {h.name} ({h.type})</p>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Portfolio Items</p>
                  {roadmap.portfolio.map((p, i) => (
                    <p key={i} className="text-sm text-muted-foreground">• {p.item}</p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-display text-base font-bold">Preparation Plans</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Resume</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {roadmap.resumePreparation.map((r, i) => <li key={i}>• {r}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Placement</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {roadmap.placementPreparation.map((r, i) => <li key={i}>• {r}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Interview</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {roadmap.interviewPreparation.map((r, i) => <li key={i}>• {r}</li>)}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-display text-base font-bold">Resources & Tips</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Free Resources</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {roadmap.freeResources.map((r, i) => <li key={i}>• {r}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Paid Resources</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {roadmap.paidResources.map((r, i) => <li key={i}>• {r}</li>)}
                  </ul>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Tips</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {roadmap.tips.map((t, i) => <li key={i}>• {t}</li>)}
                </ul>
              </div>
            </CardContent>
          </Card>

          {roadmap.higherStudies.length > 0 && (
            <Card>
              <CardContent className="p-5 space-y-3">
                <h3 className="font-display text-base font-bold">Higher Studies</h3>
                {roadmap.higherStudies.map((h, i) => (
                  <div key={i} className="rounded-xl bg-muted/50 p-3 text-sm">
                    <p className="font-semibold">{h.option}</p>
                    <p className="text-xs text-muted-foreground">{h.benefit}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}

export { CareerRoadmap };
