import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Code2,
  GraduationCap,
  Trophy,
  Laptop,
  FolderGit2,
  Gamepad2,
  Check,
  ArrowRight,
  Github,
  Send,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Laptop,
    title: "Browser-based IDE",
    desc: "Write and run Python code directly in your browser with our Monaco-powered editor.",
  },
  {
    icon: FolderGit2,
    title: "Real-world Projects",
    desc: "Build 3 production-grade projects: To-Do App, E-commerce, and Real-time Chat.",
  },
  {
    icon: Gamepad2,
    title: "Gamified Learning",
    desc: "Earn points, maintain streaks, and climb the leaderboard as you learn.",
  },
  {
    icon: Trophy,
    title: "Leaderboard & Badges",
    desc: "Compete with peers and earn achievement badges for completing challenges.",
  },
];

const pricingTiers = [
  {
    name: "Basic",
    months: "Months 1–2",
    price: "Free Start",
    isFree: true,
    lessons: 24,
    project: "CLI To-Do App",
    features: [
      "Python Fundamentals",
      "24 interactive lessons",
      "Browser-based IDE",
      "Community access",
    ],
  },
  {
    name: "Intermediate",
    months: "Months 3–6",
    price: "699,000 UZS",
    isFree: false,
    popular: true,
    lessons: 48,
    project: "E-commerce Backend",
    features: [
      "Django & REST Framework",
      "48 interactive lessons",
      "E-commerce project",
      "DevOps & Docker basics",
      "Priority support",
    ],
  },
  {
    name: "Advanced",
    months: "Months 7–9",
    price: "499,000 UZS",
    isFree: false,
    lessons: 36,
    project: "Real-time Chat App",
    features: [
      "WebSockets & Channels",
      "36 interactive lessons",
      "Real-time Chat project",
      "Cloud deployment",
      "Certificate of Completion",
    ],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">
              on<span className="text-primary">dev</span>.uz
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/register">Sign Up</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="inline-block px-3 py-1 mb-6 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/20">
              🚀 Start coding for free — no credit card required
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Become a{" "}
              <span className="text-primary">Python & Django</span>{" "}
              Backend Engineer in{" "}
              <span className="text-accent">9 Months</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Master backend development with 108 interactive lessons, 3 real-world
              projects, and a gamified learning experience — all from your browser.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="text-base gap-2" asChild>
                <Link to="/register">
                  Start Coding for Free <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base" asChild>
                <Link to="/syllabus">View Curriculum</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-border">
        <div className="container px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Why learn on ondev.uz?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything you need to go from zero to a professional backend developer.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="glass-card p-6 text-center hover:border-primary/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 border-t border-border">
        <div className="container px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Simple, transparent pricing</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Start free and upgrade as you progress. Pay only for the tiers you need.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingTiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className={`glass-card p-6 flex flex-col relative ${
                  tier.popular ? "border-primary/60 ring-1 ring-primary/30" : ""
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <div className="mb-4">
                  <span
                    className={`tier-badge-${tier.name.toLowerCase() === "intermediate" ? "intermediate" : tier.name.toLowerCase() === "advanced" ? "advanced" : "basic"}`}
                  >
                    {tier.name}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">{tier.months}</p>
                </div>
                <div className="mb-4">
                  <span className="text-2xl font-bold">
                    {tier.isFree ? "Free" : tier.price}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {tier.lessons} lessons · Project: {tier.project}
                </p>
                <ul className="flex-1 space-y-2 mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-secondary-foreground">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={tier.popular ? "default" : "outline"}
                  className="w-full"
                  asChild
                >
                  <Link to={tier.isFree ? "/register" : `/checkout/${tier.name.toLowerCase()}`}>
                    {tier.isFree ? "Get Started Free" : "Buy Now"}
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">
                on<span className="text-primary">dev</span>.uz
              </span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link to="/syllabus" className="hover:text-foreground transition-colors">Curriculum</Link>
              <a href="#" className="hover:text-foreground transition-colors">Blog</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
            <div className="flex gap-3 text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors"><Github className="w-5 h-5" /></a>
              <a href="#" className="hover:text-foreground transition-colors"><Send className="w-5 h-5" /></a>
              <a href="#" className="hover:text-foreground transition-colors"><MessageCircle className="w-5 h-5" /></a>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            © 2026 ondev.uz. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
