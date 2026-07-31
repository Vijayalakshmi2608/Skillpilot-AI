import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchBar } from "@/components/common/SearchBar";
import { EmptyState } from "@/components/common/EmptyState";
import { CareerCard } from "@/components/cards/CareerCard";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { careers } from "@/data/careers";

const domains = [...new Set(careers.map((c) => c.domain))];
const demands = ["All", "Very High", "High", "Moderate", "Growing"] as const;

function CareerExplorer() {
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("All");
  const [demand, setDemand] = useState<(typeof demands)[number]>("All");
  const [sort, setSort] = useState("match");

  const filtered = useMemo(() => {
    let list = careers.filter((c) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q || c.title.toLowerCase().includes(q) || c.skills.some((s) => s.toLowerCase().includes(q)) || c.description.toLowerCase().includes(q);
      const matchesDomain = domain === "All" || c.domain === domain;
      const matchesDemand = demand === "All" || c.demand === demand;
      return matchesQuery && matchesDomain && matchesDemand;
    });
    if (sort === "salary") {
      list = [...list].sort((a, b) => parseInt(b.salary.replace(/[^\d]/g, "")) - parseInt(a.salary.replace(/[^\d]/g, "")));
    } else if (sort === "growth") {
      list = [...list].sort((a, b) => b.growth - a.growth);
    } else if (sort === "demand") {
      list = [...list].sort((a, b) => b.demandScore - a.demandScore);
    } else {
      list = [...list].sort((a, b) => (b.match ?? 0) - (a.match ?? 0));
    }
    return list;
  }, [query, domain, demand, sort]);

  const hasFilters = query !== "" || domain !== "All" || demand !== "All";

  return (
    <div className="container py-10">
      <PageHeader
        title="Career Explorer"
        description="Search across 25+ careers by domain, demand or skill. Compare salaries, growth and education paths."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Career Explorer" }]}
        actions={
          hasFilters ? (
            <Button variant="ghost" size="sm" onClick={() => { setQuery(""); setDomain("All"); setDemand("All"); }}>
              <X className="h-4 w-4" /> Clear filters
            </Button>
          ) : undefined
        }
      />

      <div className="mt-8 rounded-2xl border bg-card p-4 shadow-card">
        <div className="grid gap-3 lg:grid-cols-[1fr_200px_200px_180px]">
          <SearchBar value={query} onChange={setQuery} placeholder="Search careers, skills, keywords..." />
          <Select value={domain} onChange={(e) => setDomain(e.target.value)} aria-label="Domain">
            <option value="All">All Domains</option>
            {domains.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </Select>
          <Select value={demand} onChange={(e) => setDemand(e.target.value as typeof demand)} aria-label="Demand">
            {demands.map((d) => (
              <option key={d} value={d}>{d === "All" ? "Any Demand" : d}</option>
            ))}
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
            <option value="match">Sort: Best Match</option>
            <option value="salary">Sort: Salary</option>
            <option value="growth">Sort: Growth</option>
            <option value="demand">Sort: Demand</option>
          </Select>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {filtered.length} careers found
          {domain !== "All" && <Badge variant="secondary">{domain}</Badge>}
          {demand !== "All" && <Badge variant="secondary">{demand} demand</Badge>}
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.5) }}>
            <CareerCard career={c} match className="h-full" index={i} />
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-8">
          <EmptyState
            title="No careers match your filters"
            description="Try removing some filters or searching for a different keyword."
            action={<Button variant="outline" onClick={() => { setQuery(""); setDomain("All"); setDemand("All"); }}>Reset Filters</Button>}
          />
        </div>
      )}
    </div>
  );
}

export { CareerExplorer };
