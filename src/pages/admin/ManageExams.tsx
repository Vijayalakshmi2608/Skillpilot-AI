import { ScrollText } from "lucide-react";
import { ManagementTable } from "@/components/common/ManagementTable";
import { Badge } from "@/components/ui/badge";
import { exams } from "@/data/exams";

function ManageExams() {
  return (
    <ManagementTable
      title="Manage Entrance Exams"
      description="Exam calendar with dates, deadlines and seat counts."
      entityName="Exam"
      addLabel="Add Exam"
      icon={<ScrollText className="h-5 w-5" />}
      data={exams}
      searchKeys={["name", "conductingBody"]}
      searchPlaceholder="Search exams..."
      filters={[{ key: "mode", label: "Mode", options: ["Online", "Offline", "Hybrid"] }, { key: "level", label: "Level", options: ["Class 12", "UG Entrance"] }]}
      columns={[
        {
          header: "Exam",
          render: (r) => {
            const e = r as (typeof exams)[number];
            return (
              <div>
                <p className="font-medium">{e.name}</p>
                <p className="text-xs text-muted-foreground">{e.conductingBody}</p>
              </div>
            );
          },
        },
        { header: "Date", render: (r) => <span className="text-xs font-semibold">{(r as { examDate: string }).examDate}</span> },
        { header: "Reg. Deadline", hidden: "hidden md:table-cell", render: (r) => <Badge variant="warning">{(r as { registrationDeadline: string }).registrationDeadline}</Badge> },
        {
          header: "Mode",
          hidden: "hidden lg:table-cell",
          render: (r) => {
            const mode = (r as { mode: string }).mode;
            return <Badge variant={mode === "Online" ? "secondary" : "muted"}>{mode}</Badge>;
          },
        },
        { header: "Seats", hidden: "hidden xl:table-cell", render: (r) => <span className="text-muted-foreground">{(r as { seats: string }).seats}</span> },
      ]}
    />
  );
}

export { ManageExams };
