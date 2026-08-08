import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookMarked, Building2, GraduationCap, LayoutDashboard, Landmark, ScrollText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { StatCard } from "@/components/common/StatCard";
import { ChartCard } from "@/components/charts/ChartCard";
import { AreaChartCard } from "@/components/charts/AreaChartCard";
import { BarChartCard } from "@/components/charts/BarChartCard";
import { DonutChartCard } from "@/components/charts/DonutChartCard";
import { adminStats, registrationTrend, domainPopularity, careerAnalytics, recentRegistrations, adminActivity } from "@/data/admin";

function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of platform activity for August 2026.</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => {}}>Export Overview</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Students" value="12,540" icon={Users} delta={8} gradient="blue" hint="+780 this week" index={0} />
        <StatCard title="Active Assessments" value="3,420" icon={GraduationCap} delta={12} gradient="violet" hint="This month" index={1} />
        <StatCard title="Colleges Listed" value="320" icon={Building2} delta={4} gradient="emerald" hint="+120 with 2026 cutoffs" index={2} />
        <StatCard title="Scholarships Tracked" value="145" icon={Landmark} delta={6} gradient="amber" hint="34 synced from NSP" index={3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ChartCard title="Student Registrations" description="New students & assessments per month" action={<Badge variant="accent">+19% MoM</Badge>}>
            <div className="h-64">
              <AreaChartCard data={registrationTrend} xKey="month" series={[{ key: "students", name: "Students", color: "#2563EB" }, { key: "assessments", name: "Assessments", color: "#10B981" }]} />
            </div>
          </ChartCard>
          <ChartCard title="Career Interest vs Applications" description="Most popular career domains">
            <div className="h-72">
              <BarChartCard data={careerAnalytics} xKey="career" bars={[{ key: "interest", name: "Interest %", color: "#2563EB" }, { key: "applications", name: "Applications %", color: "#10B981" }]} />
            </div>
          </ChartCard>
        </div>

        <div className="space-y-6">
          <ChartCard title="Domain Popularity" description="Share of student interest">
            <div className="h-56">
              <DonutChartCard data={domainPopularity} centerLabel="Domains" centerValue="34" />
            </div>
          </ChartCard>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Registrations</CardTitle>
              <Link to="/admin/students" className="text-xs font-semibold text-primary hover:underline">View all</Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentRegistrations.map((r) => (
                <div key={r.id} className="flex items-center gap-3">
                  <Avatar initials={r.name.split(" ").map((n) => n[0]).join("").slice(0, 2)} color={r.color} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.domain}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{r.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Activity Timeline</CardTitle>
            <Badge variant="muted">Live</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {adminActivity.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-br from-blue-600 to-emerald-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.detail}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{a.time}</span>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><LayoutDashboard className="h-4 w-4 text-primary" /> Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[
              { label: "Manage Students", to: "/admin/students", icon: Users },
              { label: "Manage Careers", to: "/admin/careers", icon: BookMarked },
              { label: "Manage Colleges", to: "/admin/colleges", icon: Building2 },
              { label: "Manage Exams", to: "/admin/exams", icon: ScrollText },
            ].map((a) => (
              <Link key={a.to} to={a.to}>
                <div className="group flex items-center gap-3 rounded-xl border p-4 transition-all hover:border-primary/40 hover:bg-primary/5">
                  <a.icon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold">{a.label}</span>
                  <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { AdminDashboard };
