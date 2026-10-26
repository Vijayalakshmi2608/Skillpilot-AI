import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Building2,
  CheckCircle2,
  Compass,
  GraduationCap,
  Landmark,
  Map,
  Rocket,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/common/SectionHeading";
import { RatingStars } from "@/components/common/RatingStars";
import { DomainCard } from "@/components/cards/DomainCard";
import { domains } from "@/data/domains";
import { stories } from "@/data/stories";
import { careers } from "@/data/careers";
import { CareerCard } from "@/components/cards/CareerCard";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08 },
  }),
};

const features = [
  { icon: BrainCircuit, title: "AI Career Recommendations", desc: "Get personalized career matches based on your interests, strengths and goals.", color: "bg-gradient-to-br from-blue-600 to-indigo-600" },
  { icon: Compass, title: "Career DNA Report", desc: "Understand your personality, strengths and learning style with a detailed radar analysis.", color: "bg-gradient-to-br from-violet-500 to-purple-600" },
  { icon: Map, title: "Career Roadmaps", desc: "Follow step-by-step roadmaps from Class 12 to your dream career — no guesswork.", color: "bg-gradient-to-br from-emerald-500 to-teal-600" },
  { icon: Building2, title: "College Finder", desc: "Filter 300+ colleges by state, cutoff, fees, placement and ranking.", color: "bg-gradient-to-br from-sky-500 to-cyan-600" },
  { icon: Landmark, title: "Scholarship Finder", desc: "Discover scholarships you're eligible for, with deadlines that never slip.", color: "bg-gradient-to-br from-amber-500 to-orange-600" },
  { icon: BarChart3, title: "Career Comparison", desc: "Compare salaries, growth, demand and skills across any two careers side by side.", color: "bg-gradient-to-br from-rose-500 to-pink-600" },
];

function Landing() {
  return (
    <div className="overflow-x-clip">
      {/* HERO */}
      <section className="relative bg-hero-gradient">
        <div className="container pb-20 pt-16 sm:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
                <Badge variant="secondary" className="mb-5 gap-2 px-3 py-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> AI-Powered Career Guidance for Class 12
                </Badge>
              </motion.div>
              <motion.h1
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={1}
                className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
              >
                Your career, <span className="text-gradient">navigated by AI.</span>
              </motion.h1>
              <motion.p
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={2}
                className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground"
              >
                Stop guessing your future. Discover the careers that match your personality, explore
                colleges and scholarships, and follow a clear roadmap to success — built for Indian
                Class 12 students.
              </motion.p>
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="mt-8 flex flex-wrap gap-3">
                <Link to="/register">
                  <Button size="lg" className="group">
                    Start Your Journey
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </Link>
                <Link to="/explore">
                  <Button size="lg" variant="outline">Explore Careers</Button>
                </Link>
              </motion.div>
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4} className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {["PV", "RK", "SP", "AM"].map((ini, i) => (
                    <div key={ini} className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-background text-[10px] font-bold text-white ${["bg-blue-600", "bg-emerald-500", "bg-violet-500", "bg-amber-500"][i]}`}>
                      {ini}
                    </div>
                  ))}
                </div>
                <div>
                  <RatingStars rating={4.9} />
                  <p className="text-xs text-muted-foreground">Trusted by 12,500+ students across India</p>
                </div>
              </motion.div>
            </div>

            {/* Hero visual */}
            <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
              <div className="relative mx-auto max-w-md">
                <div className="absolute -inset-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-emerald-500/20 blur-2xl" />
                <Card className="relative overflow-hidden border-white/70 bg-white/80 shadow-2xl backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Career DNA Report</p>
                        <p className="mt-1 font-display text-2xl font-bold">Your career match</p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
                        <Trophy className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-5 space-y-3">
                      {[
                        { c: "AI / ML Engineer", m: 92, bar: "from-blue-600 to-indigo-600", w: "92%" },
                        { c: "Full-Stack Developer", m: 88, bar: "from-violet-500 to-purple-600", w: "88%" },
                        { c: "Data Scientist", m: 86, bar: "from-emerald-500 to-teal-600", w: "86%" },
                        { c: "Cyber Security", m: 82, bar: "from-amber-500 to-orange-600", w: "82%" },
                      ].map((r) => (
                        <div key={r.c}>
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="font-medium">{r.c}</span>
                            <span className="font-bold text-primary">{r.m}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div className={`h-full rounded-full bg-gradient-to-r ${r.bar} transition-all duration-1000`} style={{ width: r.w }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3 text-center text-xs font-medium text-primary">
                      ✓ Roadmap updated · NTSE deadline in 3 months
                    </div>
                  </CardContent>
                </Card>

                <div className="animate-float absolute -left-10 top-10 hidden rounded-2xl border border-white/40 bg-white/90 px-4 py-3 shadow-xl backdrop-blur sm:block">
                  <p className="flex items-center gap-2 text-xs font-semibold"><GraduationCap className="h-4 w-4 text-primary" /> 4 exams tracked</p>
                </div>
                <div className="animate-float absolute -right-8 bottom-24 hidden rounded-2xl border border-white/40 bg-white/90 px-4 py-3 shadow-xl backdrop-blur [animation-delay:1.2s] sm:block">
                  <p className="flex items-center gap-2 text-xs font-semibold"><Users className="h-4 w-4 text-emerald-500" /> 18-day streak 🔥</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-border/60 bg-muted/40">
        <div className="container grid grid-cols-2 gap-6 py-10 sm:grid-cols-4">
          {[
            { v: "12,500+", l: "Students guided" },
            { v: "34", l: "Career domains" },
            { v: "320+", l: "Colleges listed" },
            { v: "₹1,500 Cr+", l: "Scholarship value" },
          ].map((s, i) => (
            <motion.div key={s.l} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="text-center">
              <p className="font-display text-2xl font-extrabold text-gradient sm:text-3xl">{s.v}</p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.l}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="container py-20">
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to choose your path"
          description="From psychometric assessment to scholarship alerts — a complete career decision toolkit in one place."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.1 }}>
              <Card className="group h-full p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md transition-transform group-hover:scale-110 ${f.color}`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TOP CAREERS */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Trending Careers"
            title="Careers students love right now"
            description="Salaries, growth and demand — see what's hot across India's job market."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {careers.slice(0, 6).map((c, i) => (
              <CareerCard key={c.id} career={c} className="h-full" index={i} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/explore">
              <Button size="lg" variant="outline" className="group">
                Explore all {careers.length}+ careers
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* DOMAINS */}
      <section className="container py-20">
        <SectionHeading
          eyebrow="Career Domains"
          title="34 domains. One right fit."
          description="Explore every major career path available after Class 12 — from AI to UPSC."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {domains.slice(0, 8).map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <DomainCard domain={d} className="h-full" />
            </motion.div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/domains">
            <Button variant="link" className="group text-primary">
              View all 34 domains <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-y border-border/60 bg-muted/30 py-20">
        <div className="container">
          <SectionHeading eyebrow="How it works" title="Three steps to your future" />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { step: "01", icon: Target, t: "Discover", d: "Take our AI-powered career assessment and get matched to careers that fit your personality, strengths and interests." },
              { step: "02", icon: Map, t: "Plan", d: "Get a personalized roadmap — which stream, which exams, which colleges and which skills to focus on, in order." },
              { step: "03", icon: Rocket, t: "Launch", d: "Track scholarships, prep for entrance exams, build your resume and step into your career with confidence." },
            ].map((s, i) => (
              <motion.div key={s.step} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg">
                  <s.icon className="h-6 w-6" />
                </div>
                <span className="absolute right-4 top-2 font-display text-5xl font-extrabold text-muted-foreground/10">{s.step}</span>
                <h3 className="mt-5 font-display text-xl font-bold">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container py-20">
        <SectionHeading
          eyebrow="Success Stories"
          title="Students who found their compass"
          description="Real journeys from Class 12 to their dream careers — guided by Career Compass AI."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {stories.slice(0, 3).map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Card className="h-full p-6 transition-all hover:-translate-y-1 hover:shadow-glow">
                <div className="flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white ${s.color}`}>{s.initials}</div>
                  <div>
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.domain}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">"{s.quote}"</p>
                <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {s.achievement}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-20">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-emerald-600 px-8 py-14 text-center text-white sm:px-16">
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <h2 className="relative font-display text-3xl font-extrabold sm:text-4xl">Your future is waiting. Navigate it.</h2>
            <p className="relative mx-auto mt-4 max-w-xl text-white/85">
              Join 12,500+ Class 12 students who stopped guessing and started planning with AI-powered clarity.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/register">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">
                  Talk to Us
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

export { Landing };
