import { Shapes } from "lucide-react";
import { ManagementTable } from "@/components/common/ManagementTable";
import { getIcon, gradientFor } from "@/lib/icon-map";
import { cn } from "@/lib/utils";
import { domains } from "@/data/domains";

function ManageDomains() {
  return (
    <ManagementTable
      title="Manage Career Domains"
      description="All career domains and the careers mapped to them."
      entityName="Domain"
      addLabel="Add Domain"
      icon={<Shapes className="h-5 w-5" />}
      data={domains}
      searchKeys={["name", "description"]}
      searchPlaceholder="Search domains..."
      columns={[
        {
          header: "Domain",
          render: (r) => {
            const d = r as (typeof domains)[number];
            const Icon = getIcon(d.icon);
            return (
              <div className="flex items-center gap-3">
                <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-white", gradientFor(d.color))}><Icon className="h-4 w-4" /></span>
                <div>
                  <p className="font-medium">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.description}</p>
                </div>
              </div>
            );
          },
        },
        { header: "Careers", render: (r) => <span className="font-semibold">{(r as { careers: number }).careers}</span> },
        { header: "Tagline", hidden: "hidden lg:table-cell", render: (r) => <span className="text-xs text-muted-foreground">{(r as { tagline: string }).tagline}</span> },
      ]}
    />
  );
}

export { ManageDomains };
