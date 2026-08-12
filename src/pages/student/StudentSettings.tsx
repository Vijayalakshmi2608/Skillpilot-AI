import { useState } from "react";
import { toast } from "sonner";
import { Bell, Settings, Shield, Sliders, User } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

function StudentSettings() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [deadlineAlerts, setDeadlineAlerts] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [language, setLanguage] = useState("English");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your preferences, notifications and privacy."
        breadcrumbs={[{ label: "Dashboard", to: "/student/dashboard" }, { label: "Settings" }]}
        icon={Settings}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Bell className="h-4 w-4 text-primary" /> Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3.5">
              <div><p className="text-sm font-semibold">Email notifications</p><p className="text-xs text-muted-foreground">Exam deadlines, scholarship alerts</p></div>
              <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3.5">
              <div><p className="text-sm font-semibold">SMS alerts</p><p className="text-xs text-muted-foreground">Critical deadline reminders via SMS</p></div>
              <Switch checked={smsNotifs} onCheckedChange={setSmsNotifs} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3.5">
              <div><p className="text-sm font-semibold">Deadline countdowns</p><p className="text-xs text-muted-foreground">Show exam deadlines on dashboard</p></div>
              <Switch checked={deadlineAlerts} onCheckedChange={setDeadlineAlerts} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3.5">
              <div><p className="text-sm font-semibold">Marketing updates</p><p className="text-xs text-muted-foreground">Tips, webinars and offers</p></div>
              <Switch checked={marketing} onCheckedChange={setMarketing} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Sliders className="h-4 w-4 text-primary" /> Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full">
                  <option>English</option>
                  <option>Tamil</option>
                  <option>Hindi</option>
                  <option>Telugu</option>
                  <option>Malayalam</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assessment difficulty</Label>
                <Select defaultValue="standard" className="w-full">
                  <option value="standard">Standard</option>
                  <option value="detailed">Detailed (more questions)</option>
                </Select>
              </div>
              <Button onClick={() => toast.success("Preferences saved (UI demo)")}>Save Preferences</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Shield className="h-4 w-4 text-primary" /> Privacy & Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg border p-3.5">
                <div><p className="text-sm font-semibold">Change password</p><p className="text-xs text-muted-foreground">Last changed 3 months ago</p></div>
                <Button size="sm" variant="outline">Update</Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3.5">
                <div><p className="text-sm font-semibold">Two-factor authentication</p><p className="text-xs text-muted-foreground">Protect your account</p></div>
                <Button size="sm" variant="outline">Enable</Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-destructive/30 p-3.5">
                <div><p className="text-sm font-semibold text-destructive">Delete account</p><p className="text-xs text-muted-foreground">This action cannot be undone</p></div>
                <Button size="sm" variant="destructive">Delete</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export { StudentSettings };
