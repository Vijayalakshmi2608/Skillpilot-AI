import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StoryCard } from "@/components/cards/StoryCard";
import { stories } from "@/data/stories";

function SuccessStories() {
  return (
    <div className="container py-10">
      <PageHeader
        title="Success Stories"
        description="From confused Class 12 students to IITians, doctors, lawyers and officers — read the journeys of students who found their compass."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Success Stories" }]}
        icon={Trophy}
      />
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stories.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.08 }}>
            <StoryCard story={s} className="h-full" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export { SuccessStories };
