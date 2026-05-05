import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
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
  UserPlus,
  PlayCircle,
  Code2,
  Award,
  Users,
  BookOpen,
  Star,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCourses } from "@/hooks/useCourses";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const features = [
  { icon: Laptop, title: "Brauzerda IDE", desc: "Monaco muharririga asoslangan brauzer ichida kod yozing va ishga tushiring — o'rnatish kerak emas." },
  { icon: FolderGit2, title: "Amaliy loyihalar", desc: "Har bir kurs oxirida real loyiha qiling: Backend, Frontend, Mobile va boshqalar." },
  { icon: Gamepad2, title: "O'yinlashtirilgan ta'lim", desc: "Ball to'plang, kunlik faollikni saqlang va o'rganish jarayonida reytingda ko'taring." },
  { icon: Trophy, title: "Sertifikat & reyting", desc: "Boshqa o'quvchilar bilan raqobatlashing va kursni tugatganingizda raqamli sertifikat oling." },
];

const steps = [
  { icon: UserPlus, title: "1. Ro'yxatdan o'ting", desc: "Telefon raqamingiz orqali bir daqiqada hisob oching." },
  { icon: PlayCircle, title: "2. Darslarni tomosha qiling", desc: "Qisqa, aniq videolar — har biri 10–15 daqiqa." },
  { icon: Code2, title: "3. Vazifani bajaring", desc: "Brauzerdagi muharrirda kod yozing — AI darhol tekshiradi." },
  { icon: Award, title: "4. Sertifikat oling", desc: "Kursni tugatganingizda raqamli sertifikatga ega bo'lasiz." },
];

const stats = [
  { icon: Users, value: "500+", label: "O'quvchilar" },
  { icon: BookOpen, value: "108", label: "Interaktiv dars" },
  { icon: Trophy, value: "9 oy", label: "To'liq dastur" },
  { icon: Star, value: "4.8", label: "O'rtacha baho" },
];

const testimonials = [
  { name: "Bekzod Yusupov", role: "Junior Backend Developer", text: "OnDev orqali Django'ni noldan o'rgandim. 7 oydan keyin birinchi backend ishimni topdim. Vazifalar amaliy va bosqichma-bosqich." },
  { name: "Nilufar Karimova", role: "O'quvchi, 4-oy", text: "Eng yoqimlisi — kodni brauzerda yozasiz va AI darhol xato joyini ko'rsatadi. O'qituvchini kutib o'tirmaysiz." },
  { name: "Javohir Tursunov", role: "Frontend Developer", text: "Boshqa kurslarda video ko'rib qo'yardim, lekin shu yerda har bir darsdan keyin amaliyot bor — shuning uchun bilim mustahkam." },
];

const faqs = [
  { q: "Kursni tugatish uchun qancha vaqt kerak?", a: "To'liq dastur 9 oyga mo'ljallangan, lekin har kim o'z tezligida o'rganadi. Kuniga 1-2 soat ajratsangiz, belgilangan muddatda tugatasiz." },
  { q: "Oldindan dasturlash tajribasi kerakmi?", a: "Yo'q. Boshlang'ich bosqich noldan boshlanadi — birinchi darslarda hatto kompyuter qanday ishlashi tushuntiriladi." },
  { q: "Sertifikat tan olinadimi?", a: "OnDev sertifikati raqamli, har bir sertifikatning unikal ID va QR kodi bor — har kim onlayn tekshira oladi. LinkedIn'ga qo'shsa bo'ladi." },
  { q: "To'lov qanday amalga oshiriladi?", a: "Mahalliy to'lov tizimlari orqali: Payme, Click, Uzcard, Humo. Faqat siz o'rganmoqchi bo'lgan bosqich uchun to'lash mumkin." },
  { q: "Pulni qaytarish mumkinmi?", a: "Ha. Sotib olganingizdan keyin 7 kun ichida agar kurs sizga yoqmasa, to'liq qaytaramiz." },
  { q: "Darslar qaysi tilda?", a: "Hamma kontent — videolar, vazifalar, qo'llanmalar — o'zbek tilida (lotin yozuvi)." },
  { q: "Kim qo'llab-quvvatlaydi?", a: "Telegram jamiyatida boshqa o'quvchilar va instruktorlar bilan savol-javob qila olasiz. Premium bosqichda ustuvor yordam bor." },
  { q: "Sertifikat bilan ish topish mumkinmi?", a: "OnDev kasb tayyorlash dasturi — har bir kurs oxirida portfolio uchun real loyiha qurasiz. Sertifikat + portfolio bilan junior pozitsiyalarga arizalar berish mumkin." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const Index = () => {
  const { user, loading } = useAuth();
  const { courses } = useCourses({ onlyPublished: false });

  if (!loading && user) return <Navigate to="/dashboard" replace />;

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
            <a href="#courses" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground px-2">Kurslar</a>
            <a href="#how" className="hidden md:inline text-sm text-muted-foreground hover:text-foreground px-2">Qanday ishlaydi</a>
            <a href="#faq" className="hidden md:inline text-sm text-muted-foreground hover:text-foreground px-2">FAQ</a>
            <Button variant="ghost" size="sm" asChild><Link to="/login">Kirish</Link></Button>
            <Button size="sm" asChild><Link to="/register">Ro'yxatdan o'tish</Link></Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-3 py-1 mb-6 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/20">
              Birinchi oy — bepul
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              OnDev — <span className="text-primary">Chegarasiz</span>
              <br className="hidden md:block" />
              bilim oling
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Har bir dars — qisqa video, vazifa va brauzerdagi kod muharriri.
              Backend, Frontend va boshqa yo'nalishlar — bosqichma-bosqich, o'zbek tilida.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="text-base gap-2" asChild>
                <Link to="/register">Bepul boshlash <ArrowRight className="w-4 h-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base" asChild>
                <a href="#courses">Kurslarni ko'rish</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-border bg-muted/20">
        <div className="container px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <s.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-extrabold text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20">
        <div className="container px-4">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary mb-3">
              <Sparkles className="w-3.5 h-3.5" /> JARAYON
            </span>
            <h2 className="text-3xl font-bold mb-3">Qanday ishlaydi?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">4 ta oddiy qadam — natija yaqqol ko'rinadi.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {steps.map((s, i) => (
              <motion.div key={s.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="glass-card p-6">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* IDE preview */}
      <section className="py-16 border-t border-border">
        <div className="container px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Brauzerda — to'liq IDE</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Hech narsa o'rnatish kerak emas. Yozing, ishga tushiring, AI tekshiradi.</p>
          </div>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto rounded-xl overflow-hidden border border-border shadow-2xl bg-[hsl(220,13%,10%)]">
            {/* fake window chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-[hsl(220,13%,8%)]">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-3 text-xs text-white/40 font-mono">vazifa_3.py</span>
            </div>
            <div className="grid md:grid-cols-2 divide-x divide-white/5">
              <pre className="p-5 text-xs md:text-sm font-mono text-white/90 leading-relaxed overflow-x-auto">
{`# Vazifa: ro'yxatdan juft sonlarni filtr qiling
def juft_sonlar(arr):
    natija = []
    for son in arr:
        if son % 2 == 0:
            natija.append(son)
    return natija

print(juft_sonlar([1, 2, 3, 4, 5, 6]))
# Kutilgan: [2, 4, 6]`}
              </pre>
              <div className="p-5 bg-[hsl(220,13%,7%)] text-xs md:text-sm font-mono">
                <div className="text-white/40 mb-2 uppercase tracking-wider text-[10px]">Natija</div>
                <div className="text-white/90 mb-3">[2, 4, 6]</div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Check className="w-4 h-4" />
                  <span>Test muvaffaqiyatli o'tdi (+50 ball)</span>
                </div>
                <div className="mt-4 text-[11px] text-white/50">
                  AI fikri: Toza yechim. Bonus: <code className="text-emerald-400">[s for s in arr if s%2==0]</code>
                </div>
              </div>
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
            <p className="text-muted-foreground max-w-xl mx-auto">Har bir kurs — noldan professional darajagacha bosqichma-bosqich yo'l.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {visibleCourses.map((c, i) => (
              <motion.div key={c.id} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className={`glass-card p-6 flex flex-col ${!c.is_published ? "opacity-70" : ""}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="text-5xl">{c.icon}</div>
                  {!c.is_published ? (
                    <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-muted text-muted-foreground flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Tez orada
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-primary/20 text-primary">Faol</span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">{c.title}</h3>
                <p className="text-xs uppercase text-muted-foreground mb-3 font-mono">{c.language}</p>
                <p className="text-sm text-muted-foreground flex-1 mb-4">
                  {c.description || "Bu kurs haqida tez orada batafsil ma'lumot bo'ladi."}
                </p>
                <Button asChild variant={c.is_published ? "default" : "outline"} disabled={!c.is_published} className="w-full gap-1">
                  <Link to={c.is_published ? "/register" : "#courses"}>
                    {c.is_published ? "Boshlash" : "Tez orada"}
                    {c.is_published && <ArrowRight className="w-4 h-4" />}
                  </Link>
                </Button>
              </motion.div>
            ))}
            {visibleCourses.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-8">Kurslar tez orada qo'shiladi.</div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-border">
        <div className="container px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Nima uchun ondev.uz?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Noldan professional dasturchigacha bo'lish uchun kerak bo'lgan hamma narsa.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <motion.div key={f.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="glass-card p-6 text-center hover:border-primary/40 transition-colors">
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

      {/* Testimonials */}
      <section className="py-20 border-t border-border">
        <div className="container px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">O'quvchilar nima deyishadi</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Real natijalar, real odamlar.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="glass-card p-6 flex flex-col">
                <Quote className="w-6 h-6 text-primary/60 mb-3" />
                <p className="text-sm text-foreground/90 leading-relaxed flex-1 mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
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
            <p className="text-muted-foreground max-w-xl mx-auto">Bepul boshlang va rivojlanish darajangizga qarab yangilang.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: "Boshlang'ich", months: "1–2 oylar", price: "Bepul", isFree: true, project: "Kirish loyihasi", features: ["Tilning asoslari", "Interaktiv darslar", "Brauzerda IDE", "Jamiyatga kirish"] },
              { name: "O'rta", months: "3–6 oylar", price: "699,000 UZS", isFree: false, popular: true, project: "Asosiy loyiha", features: ["Framework va kutubxonalar", "Mustahkam amaliyot", "Real loyiha qurilishi", "Best practices", "Ustuvor qo'llab-quvvatlash"] },
              { name: "Yuqori", months: "7–9 oylar", price: "499,000 UZS", isFree: false, project: "Final loyiha", features: ["Murakkab arxitektura", "Production darajadagi kod", "Joylashtirish va deploy", "Mock interview", "Yakuniy sertifikat"] },
            ].map((tier, i) => (
              <motion.div key={tier.name} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className={`glass-card p-6 flex flex-col relative ${tier.popular ? "border-primary/60 ring-1 ring-primary/30" : ""}`}>
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">Eng mashhur</span>
                )}
                <div className="mb-4">
                  <span className="text-sm font-semibold text-foreground">{tier.name}</span>
                  <p className="text-xs text-muted-foreground mt-1">{tier.months}</p>
                </div>
                <div className="mb-4"><span className="text-2xl font-bold">{tier.price}</span></div>
                <p className="text-sm text-muted-foreground mb-2">Loyiha: {tier.project}</p>
                <ul className="flex-1 space-y-2 mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-secondary-foreground">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Button variant={tier.popular ? "default" : "outline"} className="w-full" asChild>
                  <Link to={tier.isFree ? "/register" : `/checkout/${tier.name.toLowerCase()}`}>
                    {tier.isFree ? "Bepul boshlash" : "Sotib olish"}
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">* Narxlar har bir kurs uchun alohida amal qiladi.</p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 border-t border-border">
        <div className="container px-4 max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Tez-tez beriladigan savollar</h2>
            <p className="text-muted-foreground">Javobi yo'q savol bormi? <a href="#" className="text-primary hover:underline">Bizga yozing</a>.</p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="text-left text-base hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 border-t border-border">
        <div className="container px-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto rounded-2xl p-10 md:p-14 text-center relative overflow-hidden border border-primary/30"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.18), hsl(var(--primary) / 0.04))" }}>
            <Sparkles className="w-8 h-8 text-primary mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Bugun bepul boshlang</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Birinchi oy butunlay bepul. Karta kerak emas — faqat telefon raqami.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="text-base gap-2" asChild>
                <Link to="/register">Hisob ochish <ArrowRight className="w-4 h-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base" asChild>
                <Link to="/login">Kirish</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground">on<span className="text-primary">dev</span>.uz</span>
              </div>
              <p className="text-xs text-muted-foreground">O'zbekistonda dasturlashni o'rganish uchun interaktiv platforma.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Platforma</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#courses" className="hover:text-foreground">Kurslar</a></li>
                <li><a href="#how" className="hover:text-foreground">Qanday ishlaydi</a></li>
                <li><a href="#faq" className="hover:text-foreground">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Hisob</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/login" className="hover:text-foreground">Kirish</Link></li>
                <li><Link to="/register" className="hover:text-foreground">Ro'yxatdan o'tish</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Bog'lanish</h4>
              <div className="flex gap-3 text-muted-foreground mb-3">
                <a href="#" aria-label="Telegram" className="hover:text-foreground"><Send className="w-5 h-5" /></a>
                <a href="#" aria-label="GitHub" className="hover:text-foreground"><Github className="w-5 h-5" /></a>
                <a href="#" aria-label="Chat" className="hover:text-foreground"><MessageCircle className="w-5 h-5" /></a>
              </div>
              <p className="text-xs text-muted-foreground">hello@ondev.uz</p>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>© 2026 ondev.uz. Barcha huquqlar himoyalangan.</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-foreground">Maxfiylik siyosati</a>
              <a href="#" className="hover:text-foreground">Foydalanish shartlari</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
