import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BrainCircuit, Loader2, Sparkles, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

type CareerRecommendation = {
  careerName: string;
  careerCategory?: string;
  whyThisCareerMatches: string;
  matchScore: number;
  supportingAnswers?: string[];
  currentStrengths?: string[];
  skillGaps?: string[];
  learningResources?: string[];
  educationOptions?: string[];
  entranceExams?: string[];
  entryOpportunities?: string[];
  requiredDegree: string;
  requiredSkills: string[];
  salaryRange: string;
  futureDemand: string;
  advantages: string[];
  challenges: string[];
  requiredCertifications: string[];
  suggestedProjects: string[];
  internships: string[];
  higherStudies: string[];
  topCompanies: string[];
  roadmapSummary: string;
};

function AiRecommendation() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestInFlight = useRef(false);

  const generateRecommendations = useCallback(async () => {
    if (!user || requestInFlight.current) return;
    requestInFlight.current = true;
    setLoading(true);
    setError(null);

    try {
      const cached = await api.get<{
        success: boolean;
        data: { recommendations: CareerRecommendation[] };
      }>("/ai/career-recommendation");
      if (cached.data.recommendations.length > 0) {
        setRecommendations(cached.data.recommendations);
        return;
      }
      const response = await api.post<{
        success: boolean;
        data: { recommendations: CareerRecommendation[] };
      }>("/ai/career-recommendation", {});
      setRecommendations(response.data.recommendations);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unable to generate recommendations.";
      setError(message);
      toast.error("AI recommendations unavailable", { description: message });
    } finally {
      requestInFlight.current = false;
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void generateRecommendations();
  }, [generateRecommendations]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Career Recommendations"
        description="Recommendations grounded in your latest saved assessment answers. Match scores are estimates, not predictions."
        breadcrumbs={[{ label: "Dashboard", to: "/student/dashboard" }, { label: "AI Recommendation" }]}
        icon={BrainCircuit}
        actions={recommendations.length > 0 ? <Badge variant="accent"><Sparkles className="h-3 w-3" /> AI generated</Badge> : undefined}
      />

      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center gap-3 p-8 text-sm text-muted-foreground" role="status">
            <Loader2 className="h-5 w-5 animate-spin" />
            Generating career recommendations...
          </CardContent>
        </Card>
      )}

      {error && !loading && (
        <Card>
          <CardContent className="space-y-3 p-6 text-center">
            <p className="font-semibold">Recommendations could not be generated.</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={() => void generateRecommendations()}>Try again</Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && recommendations.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            No recommendations were returned. Update your profile and try again.
          </CardContent>
        </Card>
      )}

      {!loading && error?.toLowerCase().includes("complete the career assessment") && (
        <div className="text-center">
          <Link to="/student/assessment"><Button>Complete the assessment</Button></Link>
        </div>
      )}

      {!loading && !error && recommendations.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((career, index) => (
            <motion.div key={`${career.careerName}-${index}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Card className="h-full overflow-hidden">
                <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 to-indigo-600" />
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-lg font-bold">{career.careerName}</h2>
                      {career.careerCategory && <p className="mt-1 text-xs text-muted-foreground">{career.careerCategory}</p>}
                    </div>
                    <Badge variant="secondary">{career.futureDemand}</Badge>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">AI match</span>
                    <span className="font-bold text-primary">{career.matchScore}%</span>
                  </div>
                  <Progress value={career.matchScore} />
                  <p className="text-sm leading-relaxed text-muted-foreground">{career.whyThisCareerMatches}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-muted/60 p-2">
                      <TrendingUp className="mb-1 h-3.5 w-3.5" />
                      <span className="font-semibold">{career.salaryRange}</span>
                    </div>
                    <div className="rounded-lg bg-muted/60 p-2">
                      <Users className="mb-1 h-3.5 w-3.5" />
                      <span className="font-semibold">{career.requiredDegree}</span>
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Required skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {career.requiredSkills.map((skill) => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{career.roadmapSummary}</p>
                  <details className="rounded-lg border p-3 text-sm">
                    <summary className="cursor-pointer font-semibold">View Full Details</summary>
                    <div className="mt-3 space-y-3 text-muted-foreground">
                      {[
                        ["Assessment answers supporting this match", career.supportingAnswers],
                        ["Current strengths", career.currentStrengths || career.advantages],
                        ["Development areas", career.skillGaps || career.challenges],
                        ["Education options", career.educationOptions],
                        ["Entrance exams", career.entranceExams],
                        ["Beginner learning resources", career.learningResources],
                        ["Projects", career.suggestedProjects],
                        ["Entry opportunities", career.entryOpportunities || career.internships],
                        ["Higher studies", career.higherStudies],
                      ].map(([label, items]) => Array.isArray(items) && items.length > 0 ? (
                        <div key={label as string}>
                          <p className="font-semibold text-foreground">{label as string}</p>
                          <ul className="list-inside list-disc">{(items as string[]).map((item) => <li key={item}>{item}</li>)}</ul>
                        </div>
                      ) : null)}
                      <p><span className="font-semibold text-foreground">Required qualifications:</span> {career.requiredDegree}</p>
                      <p><span className="font-semibold text-foreground">Salary:</span> {career.salaryRange} (indicative estimate; verify for your location and experience level)</p>
                      <p><span className="font-semibold text-foreground">Future outlook:</span> {career.futureDemand} (not live market data)</p>
                      <p><span className="font-semibold text-foreground">Skills to acquire:</span> {career.requiredSkills.join(", ")}</p>
                    </div>
                  </details>
                  <Link to="/student/roadmap" state={{ selectedCareer: career.careerName }}>
                    <Button variant="outline" className="w-full">Choose This Career</Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export { AiRecommendation };
