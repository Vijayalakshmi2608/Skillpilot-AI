import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchBar } from "@/components/common/SearchBar";
import { ResourceCard } from "@/components/cards/ResourceCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { resources } from "@/data/resources";

function LearningResources() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const q = query.toLowerCase();
      return !q || r.title.toLowerCase().includes(q) || r.domain.toLowerCase().includes(q) || r.type.toLowerCase().includes(q);
    });
  }, [query]);

  const byType = (type: string) => filtered.filter((r) => r.type === type);

  return (
    <div className="container py-10">
      <PageHeader
        title="Learning Resources"
        description="Curated courses, videos, books and mock tests to level up your Class 12 and entrance exam prep."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Learning Resources" }]}
        icon={BookOpen}
        actions={<SearchBar value={query} onChange={setQuery} placeholder="Search resources..." className="w-64" />}
      />

      <Tabs defaultValue="all" className="mt-8">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="Course">Courses</TabsTrigger>
          <TabsTrigger value="Video">Videos</TabsTrigger>
          <TabsTrigger value="PDF">PDFs</TabsTrigger>
          <TabsTrigger value="Quiz">Mock Tests</TabsTrigger>
          <TabsTrigger value="Book">Books</TabsTrigger>
          <TabsTrigger value="Article">Articles</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.4) }}>
                <ResourceCard resource={r} className="h-full" />
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {["Course", "Video", "PDF", "Quiz", "Book", "Article"].map((t) => (
          <TabsContent key={t} value={t}>
            {byType(t).length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {byType(t).map((r, i) => (
                  <motion.div key={r.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.4) }}>
                    <ResourceCard resource={r} className="h-full" />
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState title={`No ${t.toLowerCase()} resources found`} description="Try adjusting your search." />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export { LearningResources };
