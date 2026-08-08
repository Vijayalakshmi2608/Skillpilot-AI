import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchBar } from "@/components/common/SearchBar";
import { ExamCard } from "@/components/cards/ExamCard";
import { Select } from "@/components/ui/select";
import { exams } from "@/data/exams";
import { cn } from "@/lib/utils";

function EntranceExams() {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("All");

  const filtered = useMemo(() => {
    return exams.filter((e) => {
      const q = query.toLowerCase();
      const matchesQuery = !q || e.name.toLowerCase().includes(q) || e.domains.some((d) => d.toLowerCase().includes(q));
      const matchesLevel = level === "All" || e.level === level;
      return matchesQuery && matchesLevel;
    });
  }, [query, level]);

  const upcoming = [...filtered].sort((a, b) => a.examDate.localeCompare(b.examDate)).slice(0, 3);

  return (
    <div className="container py-10">
      <PageHeader
        title="Entrance Exams"
        description="Every major entrance exam after Class 12 — dates, deadlines, seats and eligibility at a glance."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Entrance Exams" }]}
        icon={CalendarDays}
      />

      {upcoming.length > 0 && (
        <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-primary">Upcoming Deadlines</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {upcoming.map((e) => (
              <div key={e.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CalendarDays className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{e.name}</p>
                  <p className="text-xs text-muted-foreground">Closes {e.registrationDeadline}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <SearchBar value={query} onChange={setQuery} placeholder="Search exams, domains..." className="flex-1" />
        <Select value={level} onChange={(e) => setLevel(e.target.value)} className="sm:w-48" aria-label="Level">
          <option value="All">All Levels</option>
          <option value="Class 12">Class 12</option>
          <option value="UG Entrance">UG Entrance</option>
        </Select>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((e, i) => (
          <motion.div key={e.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.4) }}>
            <ExamCard exam={e} className={cn("h-full")} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export { EntranceExams };
