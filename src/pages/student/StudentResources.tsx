import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchBar } from "@/components/common/SearchBar";
import { ResourceCard } from "@/components/cards/ResourceCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { resources } from "@/data/resources";

function StudentResources() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => resources.filter((r) => !query || r.title.toLowerCase().includes(query.toLowerCase()) || r.domain.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning Resources"
        description="Courses, mock tests and guides to level up your preparation."
        breadcrumbs={[{ label: "Dashboard", to: "/student/dashboard" }, { label: "Resources" }]}
        icon={BookOpen}
        actions={<Badge variant="success">2 in progress</Badge>}
      />
      <SearchBar value={query} onChange={setQuery} placeholder="Search resources..." />
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="Beginner">Beginner</TabsTrigger>
          <TabsTrigger value="Intermediate">Intermediate</TabsTrigger>
          <TabsTrigger value="Advanced">Advanced</TabsTrigger>
        </TabsList>
        {["all", "Beginner", "Intermediate", "Advanced"].map((lv) => {
          const list = lv === "all" ? filtered : filtered.filter((r) => r.level === lv);
          return (
            <TabsContent key={lv} value={lv}>
              {list.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((r, i) => (
                    <motion.div key={r.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}>
                      <ResourceCard resource={r} className="h-full" />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No resources found" description="Try a different search or level." />
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

export { StudentResources };
