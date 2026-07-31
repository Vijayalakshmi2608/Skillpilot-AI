import { useMemo, useState } from "react";
import { ArrowRight, Scale } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartCard } from "@/components/charts/ChartCard";
import { BarChartCard } from "@/components/charts/BarChartCard";
import { careers } from "@/data/careers";
import { buildComparisonData } from "@/data/comparison";
import { getIcon, gradientFor } from "@/lib/icon-map";
import { cn } from "@/lib/utils";

function StudentCareerComparison() {
  const [leftId, setLeftId] = useState(careers[0].id);
  const [rightId, setRightId] = useState(careers[2].id);
  const left = useMemo(() => careers.find((c) => c.id === leftId) ?? careers[0], [leftId]);
  const right = useMemo(() => careers.find((c) => c.id === rightId) ?? careers[2], [rightId]);
  const chartData = buildComparisonData(left, right);

  const rows = [
    { label: "Starting Salary", l: left.salary, r: right.salary },
    { label: "Job Demand", l: left.demand, r: right.demand },
    { label: "Growth", l: `+${left.growth}%`, r: `+${right.growth}%` },
    { label: "Fees", l: left.fees, r: right.fees },
  ];

  const LeftIcon = getIcon(left.icon);
  const RightIcon = getIcon(right.icon);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Career Comparison"
        description="Compare any two careers side by side before you commit."
        breadcrumbs={[{ label: "Dashboard", to: "/student/dashboard" }, { label: "Career Comparison" }]}
        icon={Scale}
      />

      <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <Select value={leftId} onChange={(e) => setLeftId(e.target.value)} aria-label="Career A">{careers.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</Select>
        <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-muted md:flex"><ArrowRight className="h-4 w-4 text-muted-foreground" /></div>
        <Select value={rightId} onChange={(e) => setRightId(e.target.value)} aria-label="Career B">{careers.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {[{ c: left, Icon: LeftIcon }, { c: right, Icon: RightIcon }].map(({ c, Icon }, i) => (
          <Card key={i} className="relative overflow-hidden">
            <div className={cn("absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r", gradientFor(c.color))} />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white", gradientFor(c.color))}><Icon className="h-6 w-6" /></div>
                <div><CardTitle>{c.title}</CardTitle><Badge variant="muted" className="mt-1">{c.domain}</Badge></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {rows.map((r) => (
                <div key={r.label} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                  <span className="text-xs text-muted-foreground">{r.label}</span>
                  <span className="text-sm font-bold">{i === 0 ? r.l : r.r}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Key metrics compared">
          <div className="h-72">
            <BarChartCard data={chartData} xKey="metric" bars={[{ key: "A", name: left.title, color: "#2563EB" }, { key: "B", name: right.title, color: "#10B981" }]} />
          </div>
        </ChartCard>
        <Card>
          <CardHeader><CardTitle className="text-base">Skills & education</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {[left, right].map((c) => (
              <div key={c.id}>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{c.title}</p>
                <div className="mb-3 flex flex-wrap gap-1.5">{c.skills.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}</div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Path</p>
                <div className="mt-1.5 space-y-1">{c.educationPath.map((e) => <p key={e} className="text-xs text-muted-foreground">• {e}</p>)}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { StudentCareerComparison };
