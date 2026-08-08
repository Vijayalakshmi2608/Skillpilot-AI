import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CalendarDays, Plus } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { ExamCard } from "@/components/cards/ExamCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { exams } from "@/data/exams";

function StudentExams() {
  const [tracked, setTracked] = useState<string[]>(["jee-main", "neet", "bitsat"]);
  const trackedExams = exams.filter((e) => tracked.includes(e.id));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Entrance Exams"
        description="Track your exam calendar — deadlines, dates and seats for every major entrance."
        breadcrumbs={[{ label: "Dashboard", to: "/student/dashboard" }, { label: "Entrance Exams" }]}
        icon={CalendarDays}
        actions={<Button size="sm" variant="outline" onClick={() => toast.info("Exam tracker is a UI-only demo")}><Plus className="h-4 w-4" /> Add custom exam</Button>}
      />

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-base font-bold">Your exam tracker</p>
              <p className="text-sm text-muted-foreground">{tracked.length} exams being tracked · next up: JEE Main (Jan 2027)</p>
            </div>
            <div className="flex gap-2">
              {trackedExams.map((e) => (
                <Badge key={e.id} variant="secondary">{e.name}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {exams.map((e, i) => (
          <motion.div key={e.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.35) }}>
            <ExamCard exam={e} className="h-full" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export { StudentExams };
