import { useState } from "react";
import { toast } from "sonner";
import { Download, FileText, Mail, MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { resumeTemplates } from "@/data/resumeTemplates";
import { cn } from "@/lib/utils";

function ResumeBuilder() {
  const [template, setTemplate] = useState("modern");
  const active = resumeTemplates.find((t) => t.id === template) ?? resumeTemplates[0];
  const [name, setName] = useState("Aarav Sharma");
  const [email, setEmail] = useState("aarav.sharma@student.in");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [location, setLocation] = useState("Chennai, Tamil Nadu");
  const [education, setEducation] = useState("DAV Senior Secondary School · PCM · 92% (2027)");
  const [skills, setSkills] = useState("Python, Java, HTML/CSS, Communication, Leadership");
  const [projects, setProjects] = useState("Smart Attendance App (Python + OpenCV)\nClass 12 Science Exhibition — State Winner");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resume Builder"
        description="Build a professional, Class-12-ready resume in minutes with live preview."
        breadcrumbs={[{ label: "Dashboard", to: "/student/dashboard" }, { label: "Resume Builder" }]}
        icon={FileText}
        actions={<Button onClick={() => toast.success("Resume downloaded!", { description: "Download is a UI-only demo." })}><Download className="h-4 w-4" /> Download PDF</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Editor */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">1 · Choose a template</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              {resumeTemplates.map((t) => (
                <button key={t.id} onClick={() => setTemplate(t.id)} className={cn("rounded-xl border p-3 text-left transition-all", template === t.id ? "border-primary ring-2 ring-primary/30" : "hover:border-primary/40")}>
                  <span className={cn("mb-2 block h-1.5 w-10 rounded-full", t.accent)} />
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{t.description}</p>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">2 · Your details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5"><Label>Full Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Location</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
              </div>
              <div className="space-y-1.5"><Label>Education</Label><Input value={education} onChange={(e) => setEducation(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Skills</Label><Textarea rows={2} value={skills} onChange={(e) => setSkills(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Projects / Achievements</Label><Textarea rows={3} value={projects} onChange={(e) => setProjects(e.target.value)} /></div>
            </CardContent>
          </Card>
        </div>

        {/* Live preview */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">3 · Live preview</CardTitle>
            <Badge variant="secondary">{active.name}</Badge>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-xl border shadow-lg">
              <div className={cn("h-2 w-full", active.accent)} />
              <div className="bg-white p-6 text-slate-900 dark:bg-white">
                <h2 className="font-display text-2xl font-extrabold">{name || "Your Name"}</h2>
                <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {email || "email@example.com"}</span>
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {phone}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {location}</span>
                </p>
                <Separator className="my-4 bg-slate-200" />
                <div className="space-y-4 text-sm">
                  <div>
                    <p className={cn("mb-1 inline-block rounded px-1.5 text-xs font-bold uppercase tracking-wider text-white", active.accent)}>Education</p>
                    <p className="text-slate-700">{education}</p>
                  </div>
                  <div>
                    <p className={cn("mb-1 inline-block rounded px-1.5 text-xs font-bold uppercase tracking-wider text-white", active.accent)}>Skills</p>
                    <p className="text-slate-700">{skills}</p>
                  </div>
                  <div>
                    <p className={cn("mb-1 inline-block rounded px-1.5 text-xs font-bold uppercase tracking-wider text-white", active.accent)}>Projects & Achievements</p>
                    {projects.split("\n").map((p) => <p key={p} className="text-slate-700">{p}</p>)}
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">Live preview updates as you type ✨</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { ResumeBuilder };
