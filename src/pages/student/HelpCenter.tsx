import { toast } from "sonner";
import { BookOpen, FileQuestion, Headphones, LifeBuoy, MessageCircle, Search, Video } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AccordionItem } from "@/components/ui/accordion";
import { faqs } from "@/data/faqs";

const categories = [
  { icon: FileQuestion, title: "Getting Started", desc: "Accounts, assessment basics and first steps.", color: "from-blue-600 to-indigo-600" },
  { icon: BookOpen, title: "Assessment & DNA", desc: "How assessments work and reports are built.", color: "from-violet-500 to-purple-600" },
  { icon: Video, title: "Video Guides", desc: "Watch walkthroughs of every feature.", color: "from-emerald-500 to-teal-600" },
  { icon: Headphones, title: "Contact Support", desc: "Reach a human — we reply within 24h.", color: "from-amber-500 to-orange-600" },
];

function HelpCenter() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Help Center"
        description="Find answers, watch guides or talk to support."
        breadcrumbs={[{ label: "Dashboard", to: "/student/dashboard" }, { label: "Help Center" }]}
        icon={LifeBuoy}
      />

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="How can we help? Try 'assessment' or 'scholarship'..." className="h-12 pl-10" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((c) => (
          <Card key={c.title} className="group cursor-pointer p-5 transition-all hover:-translate-y-1 hover:shadow-glow">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform group-hover:scale-110 ${c.color}`}>
              <c.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-base font-bold">{c.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="font-display text-lg font-bold">Popular questions</h2>
          {faqs.slice(0, 6).map((f) => (
            <AccordionItem key={f.id} value={f.id} trigger={f.question}>{f.answer}</AccordionItem>
          ))}
        </div>
        <Card className="h-fit">
          <CardContent className="p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
              <MessageCircle className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold">Still stuck?</h3>
            <p className="mt-1 text-sm text-muted-foreground">Our support team typically responds within 24 hours on weekdays.</p>
            <Button className="mt-4 w-full" onClick={() => toast.success("Support chat opened (UI demo)")}>Start a chat</Button>
            <Button variant="outline" className="mt-2 w-full" onClick={() => toast.info("Redirecting to contact page (UI demo)")}>Email support</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { HelpCenter };
