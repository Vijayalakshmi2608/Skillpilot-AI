import { useMemo, useState } from "react";
import { HelpCircle } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { AccordionItem } from "@/components/ui/accordion";
import { SearchBar } from "@/components/common/SearchBar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/common/EmptyState";
import { faqs } from "@/data/faqs";

const categories = ["All", "Getting Started", "Assessment", "Careers", "Colleges", "Scholarships", "Exams", "Support"];

function Faq() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return faqs.filter((f) => !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="container max-w-4xl py-10">
      <PageHeader
        title="Frequently Asked Questions"
        description="Everything you need to know about Career Compass AI. Can't find your answer? Reach out via Contact."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "FAQ" }]}
        icon={HelpCircle}
        actions={<SearchBar value={query} onChange={setQuery} placeholder="Search questions..." className="w-64" />}
      />

      <Tabs defaultValue="All" className="mt-8">
        <TabsList className="flex flex-wrap">
          {categories.map((c) => (
            <TabsTrigger key={c} value={c}>{c}</TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => {
          const list = cat === "All" ? filtered : filtered.filter((f) => f.category === cat);
          return (
            <TabsContent key={cat} value={cat} className="space-y-3">
              {list.map((f) => (
                <AccordionItem key={f.id} value={f.id} trigger={f.question}>
                  {f.answer}
                </AccordionItem>
              ))}
              {list.length === 0 && <EmptyState title="No questions found" description="Try a different search term." />}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

export { Faq };
