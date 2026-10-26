import { Landmark } from "lucide-react";
import { ManagementTable } from "@/components/common/ManagementTable";
import { Badge } from "@/components/ui/badge";
import { scholarships } from "@/data/scholarships";

function ManageScholarships() {
  return (
    <ManagementTable
      title="Manage Scholarships"
      description="Scholarship catalog with amounts, deadlines and eligibility."
      entityName="Scholarship"
      addLabel="Add Scholarship"
      icon={<Landmark className="h-5 w-5" />}
      data={scholarships}
      searchKeys={["name", "provider"]}
      searchPlaceholder="Search scholarships..."
      filters={[{ key: "category", label: "Category", options: ["Merit", "Central", "State", "Need-based", "Diversity", "Science"] }]}
      columns={[
        {
          header: "Scholarship",
          render: (r) => {
            const s = r as (typeof scholarships)[number];
            return (
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.provider}</p>
              </div>
            );
          },
        },
        { header: "Amount", render: (r) => <span className="font-semibold text-emerald-700">{(r as { amount: string }).amount}</span> },
        { header: "Deadline", hidden: "hidden md:table-cell", render: (r) => <Badge variant="warning">{(r as { deadline: string }).deadline}</Badge> },
        { header: "Eligibility", hidden: "hidden xl:table-cell", render: (r) => <span className="text-xs text-muted-foreground">{(r as { eligibility: string[] }).eligibility[0]}</span> },
      ]}
    />
  );
}

export { ManageScholarships };
