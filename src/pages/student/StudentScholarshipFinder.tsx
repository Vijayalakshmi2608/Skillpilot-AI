import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchBar } from "@/components/common/SearchBar";
import { ScholarshipCard } from "@/components/cards/ScholarshipCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Select } from "@/components/ui/select";
import { scholarships } from "@/data/scholarships";

const categories = ["All", "Merit", "Central", "State", "Need-based", "Diversity", "Science"] as const;

function StudentScholarshipFinder() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");

  const filtered = useMemo(() => {
    return scholarships.filter((s) => {
      const q = query.toLowerCase();
      return (!q || s.name.toLowerCase().includes(q) || s.provider.toLowerCase().includes(q)) && (category === "All" || s.category === category);
    });
  }, [query, category]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scholarship Finder"
        description="Scholarships matched to your profile — amounts, eligibility and deadlines."
        breadcrumbs={[{ label: "Dashboard", to: "/student/dashboard" }, { label: "Scholarship Finder" }]}
        icon={GraduationCap}
      />
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchBar value={query} onChange={setQuery} placeholder="Search scholarships..." className="flex-1" />
        <Select value={category} onChange={(e) => setCategory(e.target.value as typeof category)} className="sm:w-52" aria-label="Category">
          {categories.map((c) => <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>)}
        </Select>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s, i) => <motion.div key={s.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.05, 0.35) }}><ScholarshipCard scholarship={s} className="h-full" /></motion.div>)}
      </div>
      {filtered.length === 0 && <EmptyState title="No scholarships found" description="Try a different search or category." />}
    </div>
  );
}

export { StudentScholarshipFinder };
