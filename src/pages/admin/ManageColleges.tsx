import { Building2 } from "lucide-react";
import { ManagementTable } from "@/components/common/ManagementTable";
import { Badge } from "@/components/ui/badge";
import { colleges } from "@/data/colleges";

function ManageColleges() {
  return (
    <ManagementTable
      title="Manage Colleges"
      description="College database with cutoffs, fees and placement stats."
      entityName="College"
      addLabel="Add College"
      icon={<Building2 className="h-5 w-5" />}
      data={colleges}
      searchKeys={["name", "state", "district"]}
      searchPlaceholder="Search colleges..."
      filters={[{ key: "state", label: "State", options: [...new Set(colleges.map((c) => c.state))] }, { key: "type", label: "Type", options: ["IIT", "NIT", "Government", "Private", "Deemed"] }]}
      columns={[
        {
          header: "College",
          render: (r) => {
            const c = r as (typeof colleges)[number];
            return (
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.district}, {c.state}</p>
              </div>
            );
          },
        },
        { header: "Cutoff", render: (r) => <span className="text-xs font-semibold">{(r as { cutoff: string }).cutoff}</span> },
        { header: "Fees", hidden: "hidden md:table-cell", render: (r) => <span>{(r as { fees: string }).fees}</span> },
        { header: "Placement", hidden: "hidden lg:table-cell", render: (r) => <Badge variant="success">{(r as { placement: number }).placement}%</Badge> },
        { header: "Ranking", hidden: "hidden xl:table-cell", render: (r) => <span>#{((r as { ranking: number }).ranking)}</span> },
      ]}
    />
  );
}

export { ManageColleges };
