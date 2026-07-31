import { motion } from "framer-motion";
import { Award, BookOpen, Briefcase, Code2, Flag, GraduationCap, Rocket, Target } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const timeline = [
  { phase: "Class 12", status: "done", icon: GraduationCap, year: "2025-27", detail: "PCM stream · 92% predicted", tasks: ["Complete board preparation", "Appear for JEE Main January & April", "Build basics in Python"], color: "from-emerald-500 to-teal-600" },
  { phase: "Degree", status: "current", icon: BookOpen, year: "2027-31", detail: "B.Tech CSE / AI & DS at NIT or VIT", tasks: ["Choose college via counselling", "Maintain 8.5+ CGPA", "Join coding clubs & AI lab"], color: "from-blue-600 to-indigo-600" },
  { phase: "Skills", status: "pending", icon: Code2, year: "2027-28", detail: "Python · ML · SQL · DSA", tasks: ["DSA 300+ problems", "Build 2 ML projects", "Contribute to open source"], color: "from-violet-500 to-purple-600" },
  { phase: "Certifications", status: "pending", icon: Award, year: "2028", detail: "AWS · TensorFlow · Azure AI", tasks: ["AWS Certified Cloud Practitioner", "TensorFlow Developer Certificate", "Kaggle competition top 20%"], color: "from-amber-500 to-orange-600" },
  { phase: "Projects", status: "pending", icon: Rocket, year: "2028-29", detail: "2 flagship projects + portfolio", tasks: ["LLM-powered study assistant", "Computer vision dashboard", "Host portfolio site"], color: "from-rose-500 to-pink-600" },
  { phase: "Internship", status: "pending", icon: Briefcase, year: "2029", detail: "Summer internship at product company", tasks: ["Apply to 40+ companies", "Referral networking on LinkedIn", "Convert internship to PPO"], color: "from-sky-500 to-cyan-600" },
  { phase: "Placement", status: "pending", icon: Target, year: "2030", detail: "ML Engineer · ₹15-25 LPA target", tasks: ["Mock interviews (20+)", "System design prep", "Final placements"], color: "from-emerald-500 to-teal-600" },
  { phase: "Career Goal", status: "pending", icon: Flag, year: "2031+", detail: "ML Engineer at top product company", tasks: ["Specialize in GenAI", "Mentor juniors", "Build personal brand"], color: "from-indigo-500 to-violet-600" },
];

function CareerRoadmap() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Career Roadmap"
        description="Your personalized journey from Class 12 to ML Engineer — with tasks and milestones at every stage."
        breadcrumbs={[{ label: "Dashboard", to: "/student/dashboard" }, { label: "Career Roadmap" }]}
        icon={Flag}
        actions={<Badge variant="success">64% complete</Badge>}
      />

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-emerald-500 via-blue-600 to-indigo-600 sm:left-1/2 sm:-translate-x-1/2" />

        <div className="space-y-8">
          {timeline.map((item, i) => {
            const isLeft = i % 2 === 0;
            return (
              <motion.div key={item.phase} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className={cn("relative flex gap-5 sm:items-center", isLeft ? "sm:flex-row" : "sm:flex-row-reverse")}>
                {/* Node */}
                <span className={cn(
                  "z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-lg ring-4 ring-background",
                  item.status === "done" && "bg-gradient-to-br from-emerald-500 to-teal-600",
                  item.status === "current" && "bg-gradient-to-br from-blue-600 to-indigo-600",
                  item.status === "pending" && "bg-muted text-muted-foreground ring-muted"
                )}>
                  <item.icon className="h-4 w-4" />
                </span>

                {/* Card */}
                <Card className={cn("w-full transition-all hover:-translate-y-0.5 hover:shadow-glow sm:w-[calc(50%-3rem)]", isLeft ? "sm:text-right" : "sm:text-left")}>
                  <CardContent className="p-5">
                    <div className={cn("flex flex-wrap items-center gap-2", isLeft ? "sm:justify-end" : "sm:justify-start")}>
                      <Badge variant={item.status === "done" ? "success" : item.status === "current" ? "secondary" : "muted"}>
                        {item.status === "done" ? "Completed" : item.status === "current" ? "In Progress" : "Upcoming"}
                      </Badge>
                      <span className="text-xs font-bold text-muted-foreground">{item.year}</span>
                    </div>
                    <h3 className="mt-2 font-display text-lg font-bold">{item.phase}</h3>
                    <p className="text-sm font-medium text-primary">{item.detail}</p>
                    <ul className={cn("mt-3 space-y-1.5 text-sm text-muted-foreground", isLeft ? "sm:ml-auto" : "")}>
                      {item.tasks.map((t) => (
                        <li key={t} className="flex items-center gap-2">
                          <span className={cn("h-1.5 w-1.5 rounded-full", item.status === "done" ? "bg-emerald-500" : item.status === "current" ? "bg-blue-600" : "bg-muted-foreground/40")} />
                          <span className={isLeft ? "sm:text-right" : ""}>{t}</span>
                        </li>
                      ))}
                    </ul>
                    <div className={cn("mt-3", isLeft ? "sm:flex sm:justify-end" : "")}>
                      <Button size="sm" variant="outline" onClick={() => toast.info("Task tracker is a UI-only demo")}>
                        Mark task complete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { CareerRoadmap };
