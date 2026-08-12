import { Library } from "lucide-react";
import { ManagementTable } from "@/components/common/ManagementTable";
import { Badge } from "@/components/ui/badge";
import { resources } from "@/data/resources";

function ManageResources() {
  return (
    <ManagementTable
      title="Manage Resources"
      description="Learning resources catalog — courses, videos, PDFs and mock tests."
      entityName="Resource"
      addLabel="Add Resource"
      icon={<Library className="h-5 w-5" />}
      data={resources}
      searchKeys={["title", "provider", "domain"]}
      searchPlaceholder="Search resources..."
      filters={[{ key: "type", label: "Type", options: ["Video", "Article", "Course", "Book", "Quiz", "PDF"] }, { key: "level", label: "Level", options: ["Beginner", "Intermediate", "Advanced"] }]}
      columns={[
        {
          header: "Resource",
          render: (r) => {
            const res = r as (typeof resources)[number];
            return (
              <div>
                <p className="font-medium">{res.title}</p>
                <p className="text-xs text-muted-foreground">{res.provider}</p>
              </div>
            );
          },
        },
        { header: "Type", render: (r) => <Badge variant="muted">{(r as { type: string }).type}</Badge> },
        { header: "Domain", hidden: "hidden md:table-cell", render: (r) => <span className="text-muted-foreground">{(r as { domain: string }).domain}</span> },
        { header: "Duration", hidden: "hidden lg:table-cell", render: (r) => <span>{(r as { duration: string }).duration}</span> },
        { header: "Rating", hidden: "hidden xl:table-cell", render: (r) => <span className="font-semibold text-amber-500">{(r as { rating: number }).rating.toFixed(1)} ★</span> },
      ]}
    />
  );
}

export { ManageResources };
