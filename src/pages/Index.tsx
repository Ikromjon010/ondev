import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
    title: "Brauzerda IDE",
    desc: "Monaco muharririga asoslangan brauzer ichida Python kodlarni yozing va ishga tushiring.",
  },
  {
    icon: FolderGit2,
    title: "Amaliy loyihalar",
    desc: "3 ta haqiqiy loyiha yarating: To-Do Ilova, E-commerce va Real-time Chat.",
  },
  {
    icon: Gamepad2,
    title: "O'yinlashtirilgan ta'lim",
    desc: "Ball to'plang, kunlik faollikni saqlang va o'rganish jarayonida reyting ko'taring.",
  },
  {
    icon: Trophy,
    title: "Reyting va yutuqlar",
    desc: "Boshqa o'quvchilar bilan raqobatlashing va vazifalarni bajarganda yutuq nishonlari oling.",
  },
];

const pricingTiers = [
  {
    name: "Boshlang'ich",
    months: "1–2 oylar",
    price: "Bepul",
    isFree: true,
    lessons: 24,
    project: "CLI To-Do Ilova",
    features: [
      "Python asoslari",
      "24 ta interaktiv dars",
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
    lessons: 48,
    project: "E-commerce Backend",
    features: [
      "Django & REST Framework",
      "48 ta interaktiv dars",
      "E-commerce loyiha",
      "DevOps & Docker asoslari",
      "Ustuvor qo'llab-quvvatlash",
    ],
  },
  {
    name: "Yuqori",
    months: "7–9 oylar",
    price: "499,000 UZS",
    isFree: false,
    lessons: 36,
    project: "Real-time Chat Ilova",
    features: [
      "WebSockets & Channels",
      "36 ta interaktiv dars",
      "Real-time Chat loyiha",
      "Bulutga joylashtirish",
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
  
  if (!loading && user) return <Navigate to="/dashboard" replace />;
  
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
              🚀 Bepul boshlang — karta talab qilinmaydi
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              9 oyda{" "}
              <span className="text-primary">Python & Django</span>{" "}
              Backend Muhandis bo'ling
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              108 ta interaktiv dars, 3 ta amaliy loyiha va o'yinlashtirilgan ta'lim tajribasi bilan backend dasturlashni o'rganing — hammasi brauzeringizda.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="text-base gap-2" asChild>
                <Link to="/register">
                  Bepul boshlash <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base" asChild>
                <Link to="/syllabus">Kurs dasturini ko'rish</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-border">
        <div className="container px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Nima uchun ondev.uz da o'rganish kerak?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Noldan professional backend dasturchigacha bo'lish uchun kerak bo'lgan hamma narsa.
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
                  {tier.lessons} ta dars · Loyiha: {tier.project}
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
              <Link to="/syllabus" className="hover:text-foreground transition-colors">Kurs dasturi</Link>
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
