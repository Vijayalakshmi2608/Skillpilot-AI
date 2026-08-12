import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchBar } from "@/components/common/SearchBar";
import { ScholarshipCard } from "@/components/cards/ScholarshipCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Select } from "@/components/ui/select";
import { scholarships } from "@/data/scholarships";

const categories = ["All", "Merit", "Central", "State", "Need-based", "Diversity", "Science"] as const;

function ScholarshipFinder() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");

  const filtered = useMemo(() => {
    return scholarships.filter((s) => {
      const q = query.toLowerCase();
      const matchesQuery = !q || s.name.toLowerCase().includes(q) || s.provider.toLowerCase().includes(q);
      const matchesCategory = category === "All" || s.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [query, category]);

  return (
    <div className="container py-10">
      <PageHeader
        title="Scholarship Finder"
        description="Find scholarships you're eligible for — with amounts, eligibility and deadlines at a glance."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Scholarship Finder" }]}
      />

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <SearchBar value={query} onChange={setQuery} placeholder="Search scholarships or providers..." className="flex-1" />
        <Select value={category} onChange={(e) => setCategory(e.target.value as typeof category)} className="sm:w-56" aria-label="Category">
          {categories.map((c) => <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>)}
        </Select>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.05, 0.4) }}>
            <ScholarshipCard scholarship={s} className="h-full" />
          </motion.div>
        ))}
      </div>
      {filtered.length === 0 && <div className="mt-8"><EmptyState title="No scholarships found" description="Try a different search or category." /></div>}
    </div>
  );
}

export { ScholarshipFinder };
