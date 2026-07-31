import { useState } from "react";
import { toast } from "sonner";
import { Globe, Lock, Settings, Shield, Sliders } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

function AdminSettings() {
  const [maintenance, setMaintenance] = useState(false);
  const [autoApprove, setAutoApprove] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Settings"
        description="Platform configuration, maintenance and security controls."
        breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Settings" }]}
        icon={Settings}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Globe className="h-4 w-4 text-primary" /> Platform Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Platform name</Label>
              <Input defaultValue="Career Compass AI" />
            </div>
            <div className="space-y-2">
              <Label>Support email</Label>
              <Input defaultValue="hello@careercompass.ai" />
            </div>
            <div className="space-y-2">
              <Label>Default language</Label>
              <Select defaultValue="English"><option>English</option><option>Tamil</option><option>Hindi</option></Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3.5">
              <div><p className="text-sm font-semibold">Maintenance mode</p><p className="text-xs text-muted-foreground">Temporarily disable student access</p></div>
              <Switch checked={maintenance} onCheckedChange={setMaintenance} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3.5">
              <div><p className="text-sm font-semibold">Auto-approve registrations</p><p className="text-xs text-muted-foreground">Skip manual student verification</p></div>
              <Switch checked={autoApprove} onCheckedChange={setAutoApprove} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3.5">
              <div><p className="text-sm font-semibold">Weekly email digest</p><p className="text-xs text-muted-foreground">Platform stats to admins every Monday</p></div>
              <Switch checked={emailDigest} onCheckedChange={setEmailDigest} />
            </div>
            <Button onClick={() => toast.success("Settings saved (UI demo)")}>Save Settings</Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Shield className="h-4 w-4 text-primary" /> Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Admin password</Label>
                <Input type="password" defaultValue="password123" />
              </div>
              <Button variant="outline" onClick={() => toast.success("Password updated (UI demo)")}>Update Password</Button>
              <div className="flex items-center justify-between rounded-lg border border-destructive/30 p-3.5">
                <div><p className="text-sm font-semibold text-destructive">Danger zone</p><p className="text-xs text-muted-foreground">Reset all demo data</p></div>
                <Button size="sm" variant="destructive" onClick={() => toast.error("Data reset is a UI-only demo")}>Reset Data</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Sliders className="h-4 w-4 text-primary" /> Feature Flags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg border p-3.5"><span className="font-medium">AI recommendations</span><Badge variant="success">Enabled</Badge></div>
              <div className="flex items-center justify-between rounded-lg border p-3.5"><span className="font-medium">Resume builder</span><Badge variant="success">Enabled</Badge></div>
              <div className="flex items-center justify-between rounded-lg border p-3.5"><span className="font-medium">Parent portal</span><Badge variant="muted">Disabled</Badge></div>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Lock className="h-3 w-3" /> Feature flags require developer access</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export { AdminSettings };
