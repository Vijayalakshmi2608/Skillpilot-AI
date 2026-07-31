import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  CalendarDays,
  Compass,
  Flame,
  GraduationCap,
  Heart,
  Landmark,
  Map,
  Sparkles,
  Target,
  Trophy,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { StatCard } from "@/components/common/StatCard";
import { ChartCard } from "@/components/charts/ChartCard";
import { AreaChartCard } from "@/components/charts/AreaChartCard";
import { DonutChartCard } from "@/components/charts/DonutChartCard";
import { CareerCard } from "@/components/cards/CareerCard";
import { ScholarshipCard } from "@/components/cards/ScholarshipCard";
import { studentStats, weeklyLearningData, careerMatchDistribution, studentActivity, roadmapSteps, upcomingExamsForStudent } from "@/data/dashboard";
import { careers } from "@/data/careers";
import { scholarships } from "@/data/scholarships";
import { notifications } from "@/data/notifications";
import { gradientFor } from "@/lib/icon-map";
import { cn } from "@/lib/utils";

const quickActions = [
  { label: "Take Assessment", to: "/student/assessment", icon: Compass, color: "from-blue-600 to-indigo-600" },
  { label: "View DNA Report", to: "/student/dna", icon: Sparkles, color: "from-violet-500 to-purple-600" },
  { label: "Find Colleges", to: "/student/colleges", icon: GraduationCap, color: "from-emerald-500 to-teal-600" },
  { label: "Build Resume", to: "/student/resume", icon: Award, color: "from-amber-500 to-orange-600" },
];

const roadmapIcon = {
  done: <Award className="h-3.5 w-3.5" />,
  current: <Map className="h-3.5 w-3.5" />,
  pending: <Target className="h-3.5 w-3.5" />,
};

function StudentDashboard() {
  const recommended = careers.filter((c) => ["ai-ml-engineer", "fullstack-developer", "data-scientist", "cyber-security", "digital-marketer"].includes(c.id));
  const saved = careers.filter((c) => ["ai-ml-engineer", "data-scientist", "graphic-designer"].includes(c.id));
  const topScholarships = scholarships.slice(0, 3);
  const unread = notifications.filter((n) => !n.read).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-emerald-600 p-6 text-white sm:p-8">
          <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-white/70">Good morning, Aarav 👋</p>
              <h1 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">Ready to fly toward your AI career?</h1>
              <p className="mt-2 max-w-lg text-sm text-white/80">
                Your Career DNA report is ready with 4 new matches. NTSE scholarship deadline is in 3 months — don't miss it!
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link to="/student/assessment">
                <Button className="bg-white text-blue-700 hover:bg-blue-50">
                  <Compass className="h-4 w-4" /> Retake Assessment
                </Button>
              </Link>
              <Link to="/student/recommendation">
                <Button variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">
                  View Matches <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Career Score" value={`${studentStats.careerScore}/100`} icon={Target} delta={6} gradient="blue" hint="Top 12% of students" index={0} />
        <StatCard title="Profile Completion" value={`${studentStats.profileCompletion}%`} icon={User} gradient="violet" hint="Add board scores to improve" index={1} />
        <StatCard title="Learning Streak" value={`${studentStats.streak} days`} icon={Flame} delta={3} gradient="amber" hint="Personal best: 21 days" index={2} />
        <StatCard title="Roadmap Progress" value={`${studentStats.roadmapProgress}%`} icon={Map} delta={12} gradient="emerald" hint="2 phases complete" index={3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Charts */}
        <div className="space-y-6 lg:col-span-2">
          <ChartCard title="Weekly Learning Hours" description="Your study consistency this week" action={<Badge variant="accent">+12% vs last week</Badge>}>
            <div className="h-64">
              <AreaChartCard data={weeklyLearningData} xKey="day" series={[{ key: "hours", name: "Hours", color: "#2563EB" }]} />
            </div>
          </ChartCard>

          <div className="grid gap-6 sm:grid-cols-2">
            <ChartCard title="Career Interests" description="Assessment match distribution">
              <div className="h-56">
                <DonutChartCard data={careerMatchDistribution} centerLabel="Domains" centerValue="5" />
              </div>
            </ChartCard>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Roadmap Progress</CardTitle>
                <CardDescription>Your journey to ML Engineer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {roadmapSteps.map((step, i) => (
                  <div key={step.label} className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px]",
                        step.status === "done" && "bg-emerald-500 text-white",
                        step.status === "current" && "bg-blue-600 text-white ring-2 ring-blue-600/30",
                        step.status === "pending" && "bg-muted text-muted-foreground"
                      )}
                    >
                      {roadmapIcon[step.status as keyof typeof roadmapIcon]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{step.label}</p>
                      <p className="truncate text-xs text-muted-foreground">{step.detail}</p>
                    </div>
                    {i < roadmapSteps.length - 1 && <span className="hidden" />}
                  </div>
                ))}
                <Link to="/student/roadmap" className="mt-2 block text-xs font-semibold text-primary hover:underline">
                  View full roadmap →
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right rail */}
        <div className="space-y-6">
          {/* Quick actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {quickActions.map((a) => (
                <Link key={a.label} to={a.to}>
                  <div className={cn("group flex flex-col items-center gap-2 rounded-xl bg-gradient-to-br p-4 text-center text-white shadow-md transition-transform hover:scale-[1.03]", a.color)}>
                    <a.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                    <span className="text-xs font-semibold">{a.label}</span>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming exams */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><CalendarDays className="h-4 w-4 text-primary" /> Upcoming Exams</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingExamsForStudent.map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-semibold">{e.name}</p>
                    <p className="text-xs text-muted-foreground">{e.date} · in {e.daysLeft} days</p>
                  </div>
                  <span className={cn("h-2.5 w-2.5 rounded-full bg-gradient-to-r", gradientFor(e.color))} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base"><Bell className="h-4 w-4 text-primary" /> Notifications</CardTitle>
              <Link to="/student/notifications" className="text-xs font-semibold text-primary hover:underline">View all</Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {unread.map((n) => (
                <div key={n.id} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm font-medium leading-snug">{n.title}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{n.message}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground/60">{n.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recommended careers */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">Recommended for you</h2>
            <p className="text-sm text-muted-foreground">Based on your latest assessment</p>
          </div>
          <Link to="/student/recommendation" className="text-sm font-semibold text-primary hover:underline">View all matches</Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recommended.slice(0, 3).map((c, i) => (
            <CareerCard key={c.id} career={c} match className="h-full" index={i} />
          ))}
        </div>
      </div>

      {/* Saved careers */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Saved careers</h2>
          <Link to="/student/saved" className="text-sm font-semibold text-primary hover:underline">Manage saved</Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((c, i) => (
            <CareerCard key={c.id} career={c} className="h-full" index={i} />
          ))}
        </div>
      </div>

      {/* Scholarship highlights */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold"><Landmark className="h-5 w-5 text-emerald-500" /> Scholarship highlights</h2>
          <Link to="/student/scholarships" className="text-sm font-semibold text-primary hover:underline">Find more</Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {topScholarships.map((s, i) => (
            <ScholarshipCard key={s.id} scholarship={s} className="h-full" />
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base"><Flame className="h-4 w-4 text-amber-500" /> Recent Activity</CardTitle>
          <Badge variant="muted">18-day streak 🔥</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {studentActivity.map((a) => (
            <div key={a.id} className="flex items-start gap-3">
              <Avatar initials={a.icon.slice(0, 1).toUpperCase()} color={cn("bg-gradient-to-br", gradientFor(a.tone === "primary" ? "blue" : a.tone === "accent" ? "emerald" : a.tone === "warning" ? "amber" : "slate"))} size="sm" />
              <div className="flex-1">
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.detail}</p>
              </div>
              <span className="text-xs text-muted-foreground">{a.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export { StudentDashboard };
