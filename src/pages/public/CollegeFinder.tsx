import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchBar } from "@/components/common/SearchBar";
import { EmptyState } from "@/components/common/EmptyState";
import { CollegeCard } from "@/components/cards/CollegeCard";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { colleges } from "@/data/colleges";

const states = [...new Set(colleges.map((c) => c.state))].sort();
const types = ["All", "IIT", "NIT", "Government", "Private", "Deemed"] as const;

function CollegeFinder() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState("All");
  const [type, setType] = useState<(typeof types)[number]>("All");
  const [hostelOnly, setHostelOnly] = useState(false);
  const [placementMin, setPlacementMin] = useState("0");

  const filtered = useMemo(() => {
    return colleges.filter((c) => {
      const q = query.toLowerCase();
      const matchesQuery = !q || c.name.toLowerCase().includes(q) || c.district.toLowerCase().includes(q) || c.courses.some((cr) => cr.toLowerCase().includes(q));
      const matchesState = state === "All" || c.state === state;
      const matchesType = type === "All" || c.type === type;
      const matchesHostel = !hostelOnly || c.hostel;
      const matchesPlacement = c.placement >= parseInt(placementMin);
      return matchesQuery && matchesState && matchesType && matchesHostel && matchesPlacement;
    });
  }, [query, state, type, hostelOnly, placementMin]);

  return (
    <div className="container py-10">
      <PageHeader
        title="College Finder"
        description="Find the right college with real cutoff, fees, placement and hostel data — filtered your way."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "College Finder" }]}
      />

      <div className="mt-8 rounded-2xl border bg-card p-4 shadow-card">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <SearchBar value={query} onChange={setQuery} placeholder="Search college, city, course..." />
          <Select value={state} onChange={(e) => setState(e.target.value)} aria-label="State">
            <option value="All">All States</option>
            {states.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Select value={type} onChange={(e) => setType(e.target.value as typeof type)} aria-label="Type">
            {types.map((t) => <option key={t} value={t}>{t === "All" ? "All Types" : t}</option>)}
          </Select>
          <Select value={placementMin} onChange={(e) => setPlacementMin(e.target.value)} aria-label="Placement">
            <option value="0">Any placement %</option>
            <option value="80">80%+ placement</option>
            <option value="85">85%+ placement</option>
            <option value="90">90%+ placement</option>
          </Select>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <Checkbox
            id="hostel"
            checked={hostelOnly}
            onChange={(e) => setHostelOnly(e.target.checked)}
            label="Hostel available only"
          />
          <span className="text-xs text-muted-foreground">{filtered.length} colleges found</span>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.4) }}>
            <CollegeCard college={c} className="h-full" />
          </motion.div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="mt-8">
          <EmptyState
            title="No colleges match your filters"
            description="Try broadening your search criteria."
            action={<Button variant="outline" onClick={() => { setQuery(""); setState("All"); setType("All"); setHostelOnly(false); setPlacementMin("0"); }}>Reset Filters</Button>}
          />
        </div>
      )}
    </div>
  );
}

export { CollegeFinder };
