import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Bell, BookOpen, Briefcase, Compass, GraduationCap, Loader2, Map, Sparkles, Target, User } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

type DashboardCareer = {
  id: number;
  title: string;
  domain: string;
  description: string;
  matchScore?: number;
};

type DashboardData = {
  user: { fullName: string };
  stats: {
    profileCompletion: number;
    hasAssessment: boolean;
    savedCareers: number;
    roadmaps: number;
  };
  latestAssessment: {
    createdAt: string;
    scores: Record<string, number>;
    recommendations: DashboardCareer[];
  } | null;
  savedCareers: DashboardCareer[];
  roadmaps: Array<{ id: number; title: string; progress: number; updatedAt: string }>;
  notifications: Array<{ id: number; title: string; message: string; createdAt: string }>;
  upcomingExams: Array<{ id: number; name: string; examDate: string; registrationDeadline: string | null; officialUrl: string | null }>;
  scholarships: Array<{ id: number; name: string; provider: string; amount: number | null; deadline: string | null }>;
  recentActivity: Array<{ id: string; title: string; detail: string; createdAt: string }>;
};

const quickActions = [
  { label: "Take Assessment", to: "/student/assessment", icon: Compass },
  { label: "Career Recommendations", to: "/student/recommendation", icon: Sparkles },
  { label: "Explore Courses", to: "/student/skill-gap", icon: BookOpen },
  { label: "Plan a Roadmap", to: "/student/roadmap", icon: Map },
];

function StudentDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<{ success: boolean; data: DashboardData }>("/students/me/dashboard");
      setDashboard(response.data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 text-muted-foreground" role="status">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading your dashboard...
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <Card>
        <CardContent className="space-y-3 p-6 text-center">
          <p className="font-semibold">Your dashboard could not be loaded.</p>
          <p className="text-sm text-muted-foreground">{error || "No dashboard data was returned."}</p>
          <Button onClick={() => void loadDashboard()}>Try again</Button>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    { label: "Profile completion", value: `${dashboard.stats.profileCompletion}%`, icon: User, detail: "Based on saved profile fields" },
    { label: "Assessment", value: dashboard.stats.hasAssessment ? "Complete" : "Not started", icon: Target, detail: dashboard.stats.hasAssessment ? "Latest result saved" : "Start to see career matches" },
    { label: "Saved careers", value: String(dashboard.stats.savedCareers), icon: Briefcase, detail: "In your account" },
    { label: "Saved roadmaps", value: String(dashboard.stats.roadmaps), icon: Map, detail: "Available to continue" },
  ];
  const interestScores = Object.entries(dashboard.latestAssessment?.scores ?? {})
    .filter(([, score]) => Number.isFinite(score) && score > 0);
  const totalInterestScore = interestScores.reduce((total, [, score]) => total + score, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Your saved career planning progress." />

      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-emerald-600 p-6 text-white sm:p-8">
          <p className="text-sm text-white/75">Welcome back, {dashboard.user.fullName || user?.fullName || "Student"}</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">Build your next career step.</h1>
          <p className="mt-2 max-w-xl text-sm text-white/80">
            Your dashboard reflects saved account data. Complete an assessment or update your profile to personalise your plan.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to={dashboard.stats.hasAssessment ? "/student/recommendation" : "/student/assessment"}>
              <Button className="bg-white text-blue-700 hover:bg-blue-50">
                {dashboard.stats.hasAssessment ? "View career matches" : "Take career assessment"} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/student/profile">
              <Button variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">Update profile</Button>
            </Link>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Account progress">
        {stats.map(({ label, value, icon: Icon, detail }, index) => (
          <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <p className="mt-2 font-display text-2xl font-bold">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
                {label === "Profile completion" && <Progress className="mt-3" value={dashboard.stats.profileCompletion} />}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-bold">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map(({ label, to, icon: Icon }) => (
            <Link key={label} to={to}>
              <Card className="h-full transition-colors hover:border-primary/50">
                <CardContent className="flex items-center gap-3 p-4">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="flex-1 text-sm font-semibold">{label}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Assessment interest profile</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {interestScores.length ? interestScores.map(([domain, score]) => (
              <div key={domain}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="capitalize">{domain.replace(/[-_]/g, " ")}</span>
                  <span className="text-muted-foreground">{score} answer points</span>
                </div>
                <Progress value={(score / totalInterestScore) * 100} />
              </div>
            )) : <p className="py-4 text-center text-sm text-muted-foreground">Complete an assessment to see your interest profile.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Upcoming entrance exams</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {dashboard.upcomingExams.length ? dashboard.upcomingExams.map((exam) => (
              <div key={exam.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <div><p className="font-semibold">{exam.name}</p><p className="text-xs text-muted-foreground">Exam date: {exam.examDate}</p></div>
                {exam.officialUrl && <a className="text-xs font-semibold text-primary hover:underline" href={exam.officialUrl} target="_blank" rel="noreferrer">Official site</a>}
              </div>
            )) : <p className="py-4 text-center text-sm text-muted-foreground">No upcoming exam dates are available.</p>}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base"><GraduationCap className="h-4 w-4 text-primary" /> Career matches</CardTitle>
            {dashboard.latestAssessment && <Badge variant="secondary">From latest assessment</Badge>}
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.latestAssessment?.recommendations.length ? dashboard.latestAssessment.recommendations.slice(0, 4).map((career) => (
              <div key={career.id} className="rounded-xl border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="font-semibold">{career.title}</p><p className="text-xs text-muted-foreground">{career.domain}</p></div>
                  {career.matchScore !== undefined && <Badge variant="secondary">{career.matchScore} match points</Badge>}
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{career.description}</p>
              </div>
            )) : (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No assessment matches yet. Complete the career assessment to see results here.
                <div className="mt-3"><Link to="/student/assessment"><Button size="sm">Start assessment</Button></Link></div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base"><Bell className="h-4 w-4 text-primary" /> Notices</CardTitle>
            <Link to="/student/notifications" className="text-xs font-semibold text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.notifications.length ? dashboard.notifications.map((notice) => (
              <div key={notice.id} className="border-b pb-3 last:border-0 last:pb-0">
                <p className="text-sm font-semibold">{notice.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{notice.message}</p>
              </div>
            )) : <p className="py-4 text-center text-sm text-muted-foreground">There are no notices right now.</p>}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Saved careers</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {dashboard.savedCareers.length ? dashboard.savedCareers.slice(0, 4).map((career) => (
              <div key={career.id} className="rounded-lg bg-muted/50 p-3">
                <p className="font-semibold">{career.title}</p>
                <p className="text-xs text-muted-foreground">{career.domain}</p>
              </div>
            )) : <p className="py-4 text-center text-sm text-muted-foreground">You have not saved any careers yet.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Your roadmaps</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {dashboard.roadmaps.length ? dashboard.roadmaps.slice(0, 4).map((roadmap) => (
              <div key={roadmap.id} className="rounded-lg bg-muted/50 p-3">
                <div className="flex justify-between gap-3"><p className="font-semibold">{roadmap.title}</p><span className="text-xs text-muted-foreground">{roadmap.progress}%</span></div>
                <Progress className="mt-2" value={roadmap.progress} />
              </div>
            )) : <p className="py-4 text-center text-sm text-muted-foreground">Generate a career roadmap to save your next steps.</p>}
            <Link to="/student/roadmap" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">Open roadmap planner <ArrowRight className="h-3 w-3" /></Link>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Scholarship opportunities</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {dashboard.scholarships.length ? dashboard.scholarships.map((scholarship) => (
              <div key={scholarship.id} className="rounded-lg border p-3">
                <p className="font-semibold">{scholarship.name}</p>
                <p className="text-xs text-muted-foreground">{scholarship.provider}{scholarship.amount !== null ? ` · ₹${scholarship.amount.toLocaleString("en-IN")}` : ""}</p>
                {scholarship.deadline && <p className="mt-1 text-xs text-muted-foreground">Deadline: {scholarship.deadline}</p>}
              </div>
            )) : <p className="py-4 text-center text-sm text-muted-foreground">No scholarship opportunities are listed.</p>}
            <Link to="/student/scholarships" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">Browse scholarships <ArrowRight className="h-3 w-3" /></Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Recent account activity</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {dashboard.recentActivity.length ? dashboard.recentActivity.map((activity) => (
              <div key={activity.id} className="border-b pb-3 last:border-0 last:pb-0">
                <p className="text-sm font-semibold">{activity.title}</p>
                <p className="text-xs text-muted-foreground">{activity.detail}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{new Date(activity.createdAt).toLocaleDateString()}</p>
              </div>
            )) : <p className="py-4 text-center text-sm text-muted-foreground">Your saved activity will appear here.</p>}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export { StudentDashboard };
