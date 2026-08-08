import { toast } from "sonner";
import { motion } from "framer-motion";
import { BarChart3, Download, FileBarChart, FileText, Users } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const reports = [
  { id: "r1", title: "Monthly Platform Report", desc: "Registrations, assessments and engagement for August 2026.", date: "Aug 31, 2026", type: "Monthly", icon: FileBarChart, color: "from-blue-600 to-indigo-600" },
  { id: "r2", title: "Career Domain Insights", desc: "Interest and application analytics across 34 domains.", date: "Aug 28, 2026", type: "Analytics", icon: BarChart3, color: "from-violet-500 to-purple-600" },
  { id: "r3", title: "Scholarship Funnel Report", desc: "Applied → shortlisted → awarded conversion analysis.", date: "Aug 25, 2026", type: "Funnel", icon: FileText, color: "from-emerald-500 to-teal-600" },
  { id: "r4", title: "Student Demographics", desc: "Stream, city and exam-target distribution of students.", date: "Aug 20, 2026", type: "Analytics", icon: Users, color: "from-amber-500 to-orange-600" },
  { id: "r5", title: "Exam Registration Tracking", desc: "JEE / NEET / CUET registrations started via platform.", date: "Aug 15, 2026", type: "Operational", icon: FileText, color: "from-rose-500 to-pink-600" },
  { id: "r6", title: "Q2 FY27 Performance Summary", desc: "Quarterly KPIs, growth and forecasts.", date: "Aug 10, 2026", type: "Quarterly", icon: FileBarChart, color: "from-sky-500 to-cyan-600" },
];

function AdminReports() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generated reports for stakeholders — download in one click."
        breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Reports" }]}
        icon={FileBarChart}
        actions={<Button size="sm" onClick={() => toast.success("Report generation started (UI demo)")}>Generate New Report</Button>}
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="group h-full p-5 transition-all hover:-translate-y-1 hover:shadow-glow">
              <div className="flex items-start justify-between">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ${r.color}`}>
                  <r.icon className="h-5 w-5" />
                </span>
                <Badge variant="muted">{r.type}</Badge>
              </div>
              <h3 className="mt-4 font-display text-base font-bold">{r.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.desc}</p>
              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <span className="text-xs text-muted-foreground">{r.date}</span>
                <Button size="sm" variant="outline" onClick={() => toast.success(`"${r.title}" downloaded (UI demo)`)}>
                  <Download className="h-3.5 w-3.5" /> PDF
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export { AdminReports };
