import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Brain, CheckCircle2, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CareerCard } from "@/components/cards/CareerCard";
import { assessmentQuestions, assessmentResultDomains } from "@/data/assessment";
import { careers } from "@/data/careers";
import { cn } from "@/lib/utils";

function CareerAssessment() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);

  const total = assessmentQuestions.length;
  const progress = ((step) / total) * 100;
  const current = assessmentQuestions[step];
  const selected = answers[current?.id];

  const handleNext = () => {
    if (step === total - 1) {
      setFinished(true);
    } else {
      setStep(step + 1);
    }
  };

  const restart = () => {
    setAnswers({});
    setStep(0);
    setFinished(false);
  };

  const topCareers = assessmentResultDomains
    .slice()
    .sort((a, b) => b.match - a.match)
    .slice(0, 3)
    .map((r) => careers.find((c) => c.id === r.id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  if (finished) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }} className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-glow">
            <CheckCircle2 className="h-10 w-10" />
          </motion.div>
          <h1 className="mt-6 font-display text-3xl font-extrabold">Assessment complete! 🎉</h1>
          <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
            We've analyzed your responses and matched them against 25+ careers. Here are your top matches.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/student/dna"><Button size="lg"><Sparkles className="h-4 w-4" /> View Full DNA Report</Button></Link>
            <Button size="lg" variant="outline" onClick={restart}><RotateCcw className="h-4 w-4" /> Retake Assessment</Button>
          </div>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {topCareers.map((c, i) => (
            <CareerCard key={c.id} career={c} match className="h-full" index={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Career Assessment</h1>
          <p className="text-sm text-muted-foreground">8 quick questions · ~5 minutes</p>
        </div>
        <Badge variant="secondary">{step + 1} / {total}</Badge>
      </div>

      <div className="space-y-2">
        <Progress value={progress} />
        <div className="flex justify-between">
          {assessmentQuestions.map((q, i) => (
            <span key={q.id} className={cn("h-2 w-2 rounded-full transition-colors", i <= step ? "bg-primary" : "bg-muted")} />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }}>
          <Card className="border-primary/20 shadow-glow">
            <CardContent className="p-6 sm:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
                <Brain className="h-6 w-6" />
              </div>
              <h2 className="mt-5 font-display text-xl font-bold leading-snug sm:text-2xl">{current.question}</h2>
              <div className="mt-6 grid gap-3">
                {current.options.map((opt, idx) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAnswers({ ...answers, [current.id]: idx })}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-4 text-left text-sm font-medium transition-all",
                      selected === idx
                        ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/30"
                        : "border-border hover:border-primary/40 hover:bg-muted/50"
                    )}
                  >
                    <span className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors",
                      selected === idx ? "border-primary bg-primary text-white" : "border-border text-muted-foreground"
                    )}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
          <ArrowLeft className="h-4 w-4" /> Previous
        </Button>
        <Button onClick={handleNext} disabled={selected === undefined} size="lg" className="min-w-32">
          {step === total - 1 ? "See Results" : "Next"} <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      {selected === undefined && <p className="text-center text-xs text-muted-foreground">Select an option to continue</p>}
    </div>
  );
}

export { CareerAssessment };
