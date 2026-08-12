import { useState } from "react";
import { toast } from "sonner";
import { Bell, CalendarDays, Landmark, Megaphone, Info, CheckCheck } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { notifications } from "@/data/notifications";

function AdminNotifications() {
  const [list, setList] = useState(notifications);
  const unread = list.filter((n) => !n.read);
  const typeTone: Record<string, string> = { exam: "text-blue-600 bg-blue-500/10", scholarship: "text-emerald-600 bg-emerald-500/10", career: "text-violet-600 bg-violet-500/10", system: "text-slate-600 bg-slate-500/10" };
  const typeIcon: Record<string, typeof Bell> = { exam: CalendarDays, scholarship: Landmark, career: Megaphone, system: Info };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Broadcast updates to students or review system alerts."
        breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Notifications" }]}
        icon={Bell}
        actions={
          unread.length > 0 ? (
            <Button variant="outline" size="sm" onClick={() => { setList((l) => l.map((n) => ({ ...n, read: true }))); toast.success("All marked as read"); }}>
              <CheckCheck className="h-4 w-4" /> Mark all read
            </Button>
          ) : undefined
        }
      />
      <Button onClick={() => toast.info("Broadcast composer is a UI-only demo")}>Broadcast to all students</Button>
      <div className="space-y-3">
        {list.map((n) => {
          const Icon = typeIcon[n.type];
          return (
            <Card key={n.id} className={`transition-all hover:-translate-y-0.5 hover:shadow-glow ${!n.read ? "border-primary/30" : ""}`}>
              <CardContent className="flex gap-4 p-4">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${typeTone[n.type]}`}><Icon className="h-5 w-5" /></span>
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
    </div>
  );
}

export { AdminNotifications };
