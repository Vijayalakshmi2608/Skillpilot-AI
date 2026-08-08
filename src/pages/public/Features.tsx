import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, BarChart3, BrainCircuit, Building2, ClipboardList, Compass, FileText,
  GraduationCap, Landmark, Map, Puzzle, Rocket, Sparkles, Target,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const featureGroups = [
  {
    title: "Discover Yourself",
    icon: BrainCircuit,
    color: "bg-gradient-to-br from-blue-600 to-indigo-600",
    items: [
      { icon: ClipboardList, name: "Career Assessment", desc: "A multi-step psychometric test that maps your interests, strengths and work style to careers." },
      { icon: Sparkles, name: "AI Recommendations", desc: "Personalized career matches with match scores, salary and demand data for each." },
      { icon: BarChart3, name: "Career DNA Report", desc: "Personality analysis, strengths, learning style and a radar chart of your career fits." },
    ],
  },
  {
    title: "Plan Your Path",
    icon: Map,
    color: "bg-gradient-to-br from-emerald-500 to-teal-600",
    items: [
      { icon: Map, name: "Career Roadmap", desc: "Step-by-step timelines from Class 12 to placement — degree, skills, projects, internships." },
      { icon: Puzzle, name: "Skill Gap Analyzer", desc: "See what skills your dream career needs versus what you have, with courses to close the gap." },
      { icon: Target, name: "Career Comparison", desc: "Side-by-side comparisons of salary, growth, demand, fees, pros and cons." },
    ],
  },
  {
    title: "Find Your Destination",
    icon: Building2,
    color: "bg-gradient-to-br from-amber-500 to-orange-600",
    items: [
      { icon: Building2, name: "College Finder", desc: "320+ colleges filtered by state, cutoff, fees, placement, hostel and ranking." },
      { icon: Landmark, name: "Scholarship Finder", desc: "Eligibility-matched scholarships with deadlines and direct application guidance." },
      { icon: GraduationCap, name: "Entrance Exam Tracker", desc: "JEE, NEET, CUET, CLAT, NDA and more — dates, deadlines and seat counts." },
    ],
  },
  {
    title: "Build Your Career",
    icon: Rocket,
    color: "bg-gradient-to-br from-violet-500 to-purple-600",
    items: [
      { icon: FileText, name: "Resume Builder", desc: "Three professional templates with live preview to build a Class-12-ready resume." },
      { icon: BrainCircuit, name: "Learning Resources", desc: "Curated courses, mock tests, PDFs and videos for every domain." },
      { icon: Compass, name: "Saved Careers & Alerts", desc: "Bookmark careers, get exam and scholarship deadline notifications." },
    ],
  },
];

function Features() {
  return (
    <div className="container py-10">
      <PageHeader
        title="Features"
        description="A complete career guidance toolkit — discover, plan, find and build your future in one place."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Features" }]}
      />

      {featureGroups.map((group, gi) => (
        <section key={group.title} className="mt-12">
          <div className="flex items-center gap-3">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md ${group.color}`}>
              <group.icon className="h-5 w-5" />
            </span>
            <h2 className="font-display text-xl font-bold sm:text-2xl">{group.title}</h2>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {group.items.map((f, i) => (
              <motion.div key={f.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Card className="group h-full p-6 transition-all hover:-translate-y-1 hover:shadow-glow">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md transition-transform group-hover:scale-110 ${group.color}`}>
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-display text-base font-bold">{f.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      ))}

      <section className="mt-14 text-center">
        <SectionHeading title="Ready to explore all of this?" description="Create your free account and start your career journey today." />
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/register"><Button size="lg">Get Started <ArrowRight className="h-4 w-4" /></Button></Link>
          <Link to="/explore"><Button size="lg" variant="outline">Browse Careers</Button></Link>
        </div>
      </section>
    </div>
  );
}

export { Features };
