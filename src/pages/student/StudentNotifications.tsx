import { useState } from "react";
import { toast } from "sonner";
import { Bell, CalendarDays, Landmark, Sparkles, CheckCheck, Info } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { notifications } from "@/data/notifications";

const typeMeta = {
  exam: { icon: CalendarDays, tone: "text-blue-600 bg-blue-500/10" },
  scholarship: { icon: Landmark, tone: "text-emerald-600 bg-emerald-500/10" },
  career: { icon: Sparkles, tone: "text-violet-600 bg-violet-500/10" },
  system: { icon: Info, tone: "text-slate-600 bg-slate-500/10" },
} as const;

function StudentNotifications() {
  const [list, setList] = useState(notifications);
  const unread = list.filter((n) => !n.read);

  const markAll = () => {
    setList((l) => l.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const toggle = (id: string) => setList((l) => l.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));

  const renderList = (items: typeof list) =>
    items.length > 0 ? (
      <div className="space-y-3">
        {items.map((n) => {
          const meta = typeMeta[n.type];
          return (
            <Card key={n.id} className={`cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-glow ${!n.read ? "border-primary/30" : ""}`}>
              <CardContent className="flex gap-4 p-4" onClick={() => toggle(n.id)}>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.tone}`}>
                  <meta.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{n.title}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">{n.time}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{n.message}</p>
                </div>
                {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
              </CardContent>
            </Card>
          );
        })}
      </div>
    ) : (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">No notifications in this category 🎉</div>
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Exam deadlines, scholarship alerts and career updates."
        breadcrumbs={[{ label: "Dashboard", to: "/student/dashboard" }, { label: "Notifications" }]}
        icon={Bell}
        actions={
          unread.length > 0 ? (
            <Button variant="outline" size="sm" onClick={markAll}><CheckCheck className="h-4 w-4" /> Mark all read</Button>
          ) : undefined
        }
      />

      <div className="flex items-center gap-2">
        <Badge variant="secondary">{unread.length} unread</Badge>
        <Badge variant="muted">{list.length} total</Badge>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="exam">Exams</TabsTrigger>
          <TabsTrigger value="scholarship">Scholarships</TabsTrigger>
          <TabsTrigger value="career">Careers</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
        <TabsContent value="all">{renderList(list)}</TabsContent>
        <TabsContent value="unread">{renderList(unread)}</TabsContent>
        <TabsContent value="exam">{renderList(list.filter((n) => n.type === "exam"))}</TabsContent>
        <TabsContent value="scholarship">{renderList(list.filter((n) => n.type === "scholarship"))}</TabsContent>
        <TabsContent value="career">{renderList(list.filter((n) => n.type === "career"))}</TabsContent>
        <TabsContent value="system">{renderList(list.filter((n) => n.type === "system"))}</TabsContent>
      </Tabs>
    </div>
  );
}

export { StudentNotifications };
