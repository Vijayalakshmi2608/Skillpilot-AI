import { Briefcase } from "lucide-react";
import { ManagementTable } from "@/components/common/ManagementTable";
import { Badge } from "@/components/ui/badge";
import { careers } from "@/data/careers";
import { getIcon, gradientFor } from "@/lib/icon-map";
import { cn } from "@/lib/utils";

function ManageCareers() {
  return (
    <ManagementTable
      title="Manage Careers"
      description="All career profiles with salary, demand and growth data."
      entityName="Career"
      addLabel="Add Career"
      icon={<Briefcase className="h-5 w-5" />}
      data={careers}
      searchKeys={["title", "domain"]}
      searchPlaceholder="Search careers..."
      filters={[{ key: "domain", label: "Domain", options: [...new Set(careers.map((c) => c.domain))] }, { key: "demand", label: "Demand", options: ["Very High", "High", "Moderate", "Growing"] }]}
      columns={[
        {
          header: "Career",
          render: (r) => {
            const c = r as unknown as (typeof careers)[number];
            const Icon = getIcon(c.icon);
            return (
              <div className="flex items-center gap-3">
                <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-white", gradientFor(c.color))}><Icon className="h-4 w-4" /></span>
                <div>
                  <p className="font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.domain}</p>
                </div>
              </div>
            );
          },
        },
        { header: "Salary", render: (r) => <span className="font-semibold">{(r as { salary: string }).salary}</span> },
        {
          header: "Demand",
          hidden: "hidden lg:table-cell",
          render: (r) => (
            <Badge variant={(r as { demand: string }).demand === "Very High" || (r as { demand: string }).demand === "High" ? "success" : "warning"}>
              {(r as { demand: string }).demand}
            </Badge>
          ),
        },
        { header: "Growth", hidden: "hidden md:table-cell", render: (r) => <span className="font-semibold text-emerald-700">+{(r as { growth: number }).growth}%</span> },
        { header: "Skills", hidden: "hidden xl:table-cell", render: (r) => <span className="text-muted-foreground">{(r as { skills: string[] }).skills.slice(0, 3).join(", ")}</span> },
      ]}
    />
  );
}

export { ManageCareers };
