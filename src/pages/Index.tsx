import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  // Code2 removed
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
  Sparkles,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCourses } from "@/hooks/useCourses";

const features = [
  {
    icon: Laptop,
    title: "Brauzerda IDE",
    desc: "Monaco muharririga asoslangan brauzer ichida kod yozing va ishga tushiring — o'rnatish kerak emas.",
  },
  {
    icon: FolderGit2,
    title: "Amaliy loyihalar",
    desc: "Har bir kurs oxirida real loyiha qiling: Backend, Frontend, Mobile va boshqalar.",
  },
  {
    icon: Gamepad2,
    title: "O'yinlashtirilgan ta'lim",
    desc: "Ball to'plang, kunlik faollikni saqlang va o'rganish jarayonida reytingda ko'taring.",
  },
  {
    icon: Trophy,
    title: "Sertifikat & reyting",
    desc: "Boshqa o'quvchilar bilan raqobatlashing va kursni tugatganingizda raqamli sertifikat oling.",
  },
];

const pricingTiers = [
  {
    name: "Boshlang'ich",
    months: "1–2 oylar",
    price: "Bepul",
    isFree: true,
    project: "Kirish loyihasi",
    features: [
      "Tilning asoslari",
      "Interaktiv darslar",
      "Brauzerda IDE",
      "Jamiyatga kirish",
    ],
  },
  {
    name: "O'rta",
    months: "3–6 oylar",
    price: "699,000 UZS",
    isFree: false,
    popular: true,
    project: "Asosiy loyiha",
    features: [
      "Framework va kutubxonalar",
      "Mustahkam amaliyot",
      "Real loyiha qurilishi",
      "Best practices",
      "Ustuvor qo'llab-quvvatlash",
    ],
  },
  {
    name: "Yuqori",
    months: "7–9 oylar",
    price: "499,000 UZS",
    isFree: false,
    project: "Final loyiha",
    features: [
      "Murakkab arxitektura",
      "Production darajadagi kod",
      "Joylashtirish va deploy",
      "Mock interview",
      "Yakuniy sertifikat",
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
  const { user, loading } = useAuth();
  const { courses } = useCourses({ onlyPublished: false });

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  // Show all but mark unpublished as "tez orada"
  const visibleCourses = courses.slice(0, 6);

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
            <a href="#courses" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground px-2">
              Kurslar
            </a>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Kirish</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/register">Ro'yxatdan o'tish</Link>
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
              Birinchi oy — bepul
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              OnDev —{" "}
              <span className="text-primary">Chegarasiz</span>
              <br className="hidden md:block" />
              bilim oling
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Har bir dars — qisqa video, vazifa va brauzerdagi kod muharriri.
              Backend, Frontend va boshqa yo'nalishlar — bosqichma-bosqich, o'zbek tilida.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="text-base gap-2" asChild>
                <Link to="/register">
                  Bepul boshlash <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base" asChild>
                <a href="#courses">Kurslarni ko'rish</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Courses grid */}
      <section id="courses" className="py-20 border-t border-border">
        <div className="container px-4">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary mb-3">
              <Sparkles className="w-3.5 h-3.5" /> MAVJUD KURSLAR
            </span>
            <h2 className="text-3xl font-bold mb-3">O'zingizga mos yo'nalishni tanlang</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Har bir kurs — noldan professional darajagacha bosqichma-bosqich yo'l.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {visibleCourses.map((c, i) => (
              <motion.div
                key={c.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className={`glass-card p-6 flex flex-col ${!c.is_published ? "opacity-70" : ""}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-5xl">{c.icon}</div>
                  {!c.is_published ? (
                    <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-muted text-muted-foreground flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Tez orada
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-primary/20 text-primary">
                      Faol
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">{c.title}</h3>
                <p className="text-xs uppercase text-muted-foreground mb-3 font-mono">
                  {c.language}
                </p>
                <p className="text-sm text-muted-foreground flex-1 mb-4">
                  {c.description || "Bu kurs haqida tez orada batafsil ma'lumot bo'ladi."}
                </p>
                <Button
                  asChild
                  variant={c.is_published ? "default" : "outline"}
                  disabled={!c.is_published}
                  className="w-full gap-1"
                >
                  <Link to={c.is_published ? "/register" : "#courses"}>
                    {c.is_published ? "Boshlash" : "Tez orada"}
                    {c.is_published && <ArrowRight className="w-4 h-4" />}
                  </Link>
                </Button>
              </motion.div>
            ))}
            {visibleCourses.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-8">
                Kurslar tez orada qo'shiladi.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-border">
        <div className="container px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Nima uchun ondev.uz da o'rganish kerak?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Noldan professional dasturchigacha bo'lish uchun kerak bo'lgan hamma narsa.
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
            <h2 className="text-3xl font-bold mb-3">Oddiy va shaffof narxlar</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Bepul boshlang va rivojlanish darajangizga qarab yangilang. Faqat kerakli bosqich uchun to'lang.
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
                    Eng mashhur
                  </span>
                )}
                <div className="mb-4">
                  <span className="text-sm font-semibold text-foreground">
                    {tier.name}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">{tier.months}</p>
                </div>
                <div className="mb-4">
                  <span className="text-2xl font-bold">
                    {tier.isFree ? "Bepul" : tier.price}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Loyiha: {tier.project}
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
                    {tier.isFree ? "Bepul boshlash" : "Sotib olish"}
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            * Narxlar har bir kurs uchun alohida amal qiladi.
          </p>
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
              <a href="#courses" className="hover:text-foreground transition-colors">Kurslar</a>
              <a href="#" className="hover:text-foreground transition-colors">Blog</a>
              <a href="#" className="hover:text-foreground transition-colors">Aloqa</a>
            </div>
            <div className="flex gap-3 text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors"><Github className="w-5 h-5" /></a>
              <a href="#" className="hover:text-foreground transition-colors"><Send className="w-5 h-5" /></a>
              <a href="#" className="hover:text-foreground transition-colors"><MessageCircle className="w-5 h-5" /></a>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            © 2026 ondev.uz. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
