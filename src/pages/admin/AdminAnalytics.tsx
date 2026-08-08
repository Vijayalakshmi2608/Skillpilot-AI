import { BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { ChartCard } from "@/components/charts/ChartCard";
import { AreaChartCard } from "@/components/charts/AreaChartCard";
import { BarChartCard } from "@/components/charts/BarChartCard";
import { DonutChartCard } from "@/components/charts/DonutChartCard";
import { registrationTrend, careerAnalytics, domainPopularity } from "@/data/admin";

const trafficData = [
  { month: "Mar", visits: 8200, unique: 5100 },
  { month: "Apr", visits: 11200, unique: 6900 },
  { month: "May", visits: 15300, unique: 9400 },
  { month: "Jun", visits: 19800, unique: 12100 },
  { month: "Jul", visits: 24700, unique: 14900 },
  { month: "Aug", visits: 31200, unique: 18600 },
];

const streamSplit = [
  { name: "PCM", value: 34 },
  { name: "PCB", value: 26 },
  { name: "Commerce", value: 22 },
  { name: "Arts", value: 18 },
];

const assessmentScores = [
  { score: "0-20", count: 420 },
  { score: "21-40", count: 980 },
  { score: "41-60", count: 2140 },
  { score: "61-80", count: 2860 },
  { score: "81-100", count: 1980 },
];

function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Deep-dive into platform engagement, traffic and assessment performance."
        breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Analytics" }]}
        icon={BarChart3}
        actions={<Badge variant="accent">Last 6 months</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Website Traffic" description="Monthly visits vs unique visitors">
          <div className="h-72">
            <AreaChartCard data={trafficData} xKey="month" series={[{ key: "visits", name: "Visits", color: "#2563EB" }, { key: "unique", name: "Unique", color: "#10B981" }]} />
          </div>
        </ChartCard>
        <ChartCard title="Assessment Score Distribution" description="How students score on the career assessment">
          <div className="h-72">
            <BarChartCard data={assessmentScores} xKey="score" bars={[{ key: "count", name: "Students", color: "#6366F1" }]} />
          </div>
        </ChartCard>
        <ChartCard title="Student Stream Split" description="Stream distribution of registered students">
          <div className="h-72">
            <DonutChartCard data={streamSplit} centerLabel="Students" centerValue="12.5k" />
          </div>
        </ChartCard>
        <ChartCard title="Career Interest vs Applications" description="Engagement by career domain">
          <div className="h-72">
            <BarChartCard data={careerAnalytics} xKey="career" bars={[{ key: "interest", name: "Interest", color: "#2563EB" }, { key: "applications", name: "Applications", color: "#F59E0B" }]} />
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Domain Popularity" description="Where students are most interested">
        <div className="h-64">
          <DonutChartCard data={domainPopularity} />
        </div>
      </ChartCard>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: "Avg. session", v: "6m 42s", d: "+42s vs last month" },
          { l: "Bounce rate", v: "28.4%", d: "-3.2% improvement" },
          { l: "Assessment completion", v: "71%", d: "+8% vs last month" },
          { l: "Conversion to student", v: "18.6%", d: "+2.1% vs last month" },
        ].map((s) => (
          <div key={s.l} className="rounded-xl border bg-card p-5 shadow-card">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.l}</p>
            <p className="mt-1 font-display text-2xl font-bold">{s.v}</p>
            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">{s.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export { AdminAnalytics };
