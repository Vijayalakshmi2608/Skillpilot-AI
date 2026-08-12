import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchBar } from "@/components/common/SearchBar";
import { DomainCard } from "@/components/cards/DomainCard";
import { EmptyState } from "@/components/common/EmptyState";
import { domains } from "@/data/domains";

function CareerDomains() {
  const [query, setQuery] = useState("");
  const filtered = domains.filter(
    (d) => d.name.toLowerCase().includes(query.toLowerCase()) || d.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="container py-10">
      <PageHeader
        title="Career Domains"
        description="34 major career domains available after Class 12 — explore each one to find where you belong."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Career Domains" }]}
        actions={<SearchBar value={query} onChange={setQuery} placeholder="Search domains..." className="w-64" />}
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((d, i) => (
          <motion.div key={d.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.4) }}>
            <DomainCard domain={d} className="h-full" />
          </motion.div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="mt-8">
          <EmptyState title="No domains found" description={`No domains matched "${query}". Try another search.`} />
        </div>
      )}
    </div>
  );
}

export { CareerDomains };
