import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Brain, CheckCircle2, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type AssessmentOption = {
  id: number;
  text: string;
  value: string | null;
};

type AssessmentQuestion = {
  id: number;
  question: string;
  category: string | null;
  options: AssessmentOption[];
};

type AssessmentCareer = {
  id: number;
  title: string;
  domain: string;
  matchScore: number;
};

type AssessmentResult = {
  scores: Record<string, number>;
  recommendations: AssessmentCareer[];
};

function CareerAssessment() {
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const questionsRequest = api.get<{ success: boolean; data: AssessmentQuestion[] }>("/assessment/questions?per_page=100")
      .then((response) => {
        if (active) setQuestions(response.data);
      })
      .catch((error: unknown) => {
        if (active) {
          setQuestionError(error instanceof Error ? error.message : "Unable to load assessment questions.");
        }
      });
    const resultsRequest = api.get<{ success: boolean; data: Array<{ result: AssessmentResult }> }>("/assessment/results")
      .then((response) => {
        if (active && response.data.length > 0) {
          setResult(response.data[0].result);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          toast.error("Unable to load previous assessment results", {
            description: error instanceof Error ? error.message : "Please try again.",
          });
        }
      });
    Promise.all([questionsRequest, resultsRequest]).finally(() => {
      if (active) setQuestionsLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const current = questions[step];
  const selected = current ? answers[current.id] : undefined;

  const handleNext = async () => {
    if (!current || selected === undefined || submitting) return;
    if (step < questions.length - 1) {
      setStep((currentStep) => currentStep + 1);
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post<{ success: boolean; data: { result: AssessmentResult } }>("/assessment/submit", {
        answers: Object.entries(answers).map(([questionId, optionId]) => ({
          questionId: Number(questionId),
          optionId,
        })),
      });
      setResult(response.data.result);
    } catch (error) {
      toast.error("Unable to submit assessment", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const restart = () => {
    setAnswers({});
    setStep(0);
    setResult(null);
  };

  if (questionsLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 text-muted-foreground" role="status">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading assessment questions...
      </div>
    );
  }

  if (questionError || questions.length === 0) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="space-y-3 p-6 text-center">
          <h1 className="font-display text-xl font-bold">Assessment unavailable</h1>
          <p className="text-sm text-muted-foreground">
            {questionError || "There are no active assessment questions yet."}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (result) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }} className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-glow">
            <CheckCircle2 className="h-10 w-10" />
          </motion.div>
          <h1 className="mt-6 font-display text-3xl font-extrabold">Assessment complete!</h1>
          <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
            Your answers have been saved. Your results are available from your account after you return.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/student/recommendation"><Button size="lg"><Sparkles className="h-4 w-4" /> Explore Career Recommendations</Button></Link>
            <Button size="lg" variant="outline" onClick={restart}><RotateCcw className="h-4 w-4" /> Retake Assessment</Button>
          </div>
        </motion.div>

        {result.recommendations.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.recommendations.map((career) => (
              <Card key={career.id}>
                <CardContent className="space-y-2 p-5">
                  <Badge variant="secondary">{career.domain}</Badge>
                  <h2 className="font-display text-lg font-bold">{career.title}</h2>
                  <p className="text-sm text-muted-foreground">Assessment score: {career.matchScore}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-5 text-sm text-muted-foreground">
              Your responses were saved, but no active careers currently match the assessed domains.
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Career Assessment</h1>
          <p className="text-sm text-muted-foreground">{questions.length} questions · Your results are saved to your account</p>
        </div>
        <Badge variant="secondary">{step + 1} / {questions.length}</Badge>
      </div>

      <div className="space-y-2">
        <Progress value={(step / questions.length) * 100} />
        <div className="flex justify-between">
          {questions.map((question, index) => (
            <span key={question.id} className={cn("h-2 w-2 rounded-full transition-colors", index <= step ? "bg-primary" : "bg-muted")} />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {current && (
          <motion.div key={current.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }}>
            <Card className="border-primary/20 shadow-glow">
              <CardContent className="p-6 sm:p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
                  <Brain className="h-6 w-6" />
                </div>
                <h2 className="mt-5 font-display text-xl font-bold leading-snug sm:text-2xl">{current.question}</h2>
                <div className="mt-6 grid gap-3">
                  {current.options.map((option, index) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setAnswers((previous) => ({ ...previous, [current.id]: option.id }))}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border p-4 text-left text-sm font-medium transition-all",
                        selected === option.id
                          ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/30"
                          : "border-border hover:border-primary/40 hover:bg-muted/50"
                      )}
                    >
                      <span className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors",
                        selected === option.id ? "border-primary bg-primary text-white" : "border-border text-muted-foreground"
                      )}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      {option.text}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setStep((currentStep) => Math.max(0, currentStep - 1))} disabled={step === 0 || submitting}>
          <ArrowLeft className="h-4 w-4" /> Previous
        </Button>
        <Button onClick={handleNext} disabled={selected === undefined || submitting} size="lg" className="min-w-32">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {submitting ? "Saving..." : step === questions.length - 1 ? "Submit Assessment" : "Next"}
          {!submitting && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
      {selected === undefined && <p className="text-center text-xs text-muted-foreground">Select an option to continue</p>}
    </div>
  );
}

export { CareerAssessment };
