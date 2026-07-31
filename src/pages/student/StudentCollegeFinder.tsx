import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchBar } from "@/components/common/SearchBar";
import { EmptyState } from "@/components/common/EmptyState";
import { CollegeCard } from "@/components/cards/CollegeCard";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { colleges } from "@/data/colleges";

const states = [...new Set(colleges.map((c) => c.state))].sort();
const types = ["All", "IIT", "NIT", "Government", "Private", "Deemed"] as const;

function StudentCollegeFinder() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState("All");
  const [type, setType] = useState<(typeof types)[number]>("All");
  const [hostel, setHostel] = useState(false);
  const [highPlacement, setHighPlacement] = useState(false);

  const filtered = useMemo(() => {
    return colleges.filter((c) => {
      const q = query.toLowerCase();
      const mq = !q || c.name.toLowerCase().includes(q) || c.district.toLowerCase().includes(q);
      const ms = state === "All" || c.state === state;
      const mt = type === "All" || c.type === type;
      const mh = !hostel || c.hostel;
      const mp = !highPlacement || c.placement >= 85;
      return mq && ms && mt && mh && mp;
    });
  }, [query, state, type, hostel, highPlacement]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="College Finder"
        description="Find the perfect college for your stream and budget."
        breadcrumbs={[{ label: "Dashboard", to: "/student/dashboard" }, { label: "College Finder" }]}
        icon={Building2}
      />
      <div className="rounded-2xl border bg-card p-4 shadow-card">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <SearchBar value={query} onChange={setQuery} placeholder="Search college or city..." />
          <Select value={state} onChange={(e) => setState(e.target.value)} aria-label="State"><option value="All">All States</option>{states.map((s) => <option key={s} value={s}>{s}</option>)}</Select>
          <Select value={type} onChange={(e) => setType(e.target.value as typeof type)} aria-label="Type">{types.map((t) => <option key={t} value={t}>{t === "All" ? "All Types" : t}</option>)}</Select>
          <div className="flex items-center gap-4">
            <Checkbox id="h" checked={hostel} onChange={(e) => setHostel(e.target.checked)} label="Hostel" />
            <Checkbox id="p" checked={highPlacement} onChange={(e) => setHighPlacement(e.target.checked)} label="85%+ placement" />
          </div>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c, i) => <motion.div key={c.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}><CollegeCard college={c} className="h-full" /></motion.div>)}
      </div>
      {filtered.length === 0 && <EmptyState title="No colleges match" description="Try removing some filters." action={<Button variant="outline" onClick={() => { setQuery(""); setState("All"); setType("All"); setHostel(false); setHighPlacement(false); }}>Reset</Button>} />}
    </div>
  );
}

export { StudentCollegeFinder };
