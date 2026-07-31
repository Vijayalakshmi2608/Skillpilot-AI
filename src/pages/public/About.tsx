import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, HeartHandshake, Info, Lightbulb, Rocket, Target } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const values = [
  { icon: Target, title: "Clarity over confusion", desc: "Millions of students make life-defining decisions without real information. We exist to fix that." },
  { icon: Eye, title: "Data you can trust", desc: "Salaries, cutoffs and deadlines are researched and continuously updated by our team." },
  { icon: HeartHandshake, title: "Every student matters", desc: "From metros to small towns, guidance should be free of bias and accessible to all." },
  { icon: Lightbulb, title: "AI that empowers", desc: "Technology should help you think — not think for you. Our AI explains every recommendation." },
];

const journey = [
  { year: "2024", title: "The idea", desc: "Founded after watching too many Class 12 students choose streams based on peer pressure and guesswork." },
  { year: "2025", title: "Beta launch", desc: "1,000 students piloted the career assessment across 20 schools in Tamil Nadu." },
  { year: "2026", title: "National expansion", desc: "12,500+ students onboard, 320 colleges listed, 145 scholarships tracked." },
  { year: "2027", title: "The mission", desc: "Guide 1 million Indian students to informed, confident career decisions." },
];

function About() {
  return (
    <div className="container py-10">
      <PageHeader
        title="About Career Compass AI"
        description="We're on a mission to make career guidance scientific, personalized and free for every Class 12 student in India."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "About" }]}
        icon={Info}
      />

      <section className="mt-10">
        <SectionHeading align="left" title="Why we exist" />
        <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
          Every year, <span className="font-semibold text-foreground">12 million students</span> appear for Class 12
          boards in India. Most have no career counselor, no reliable data, and just 48 hours to choose a stream that
          decides the next 40 years of their life. Career Compass AI brings psychometric science, labor-market data and
          AI together — so every student can make a decision they understand and own.
        </p>
      </section>

      <section className="mt-14">
        <SectionHeading eyebrow="Our Values" title="What we believe in" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <Card className="h-full p-6 transition-all hover:-translate-y-1 hover:shadow-glow">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
                  <v.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-base font-bold">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <SectionHeading eyebrow="Our Journey" title="From idea to impact" />
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {journey.map((j, i) => (
            <motion.div key={j.year} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="relative">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 font-display text-xs font-bold text-white">{j.year}</span>
              <h3 className="mt-3 font-display text-base font-bold">{j.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{j.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <div className="rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-emerald-600 p-10 text-center text-white">
          <Rocket className="mx-auto h-10 w-10 opacity-80" />
          <h2 className="mt-4 font-display text-2xl font-extrabold sm:text-3xl">Be part of the journey</h2>
          <p className="mx-auto mt-2 max-w-md text-white/85">Join 12,500+ students who found their compass with us.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/register"><Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">Get Started Free</Button></Link>
            <Link to="/contact"><Button size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">Partner with us</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export { About };
