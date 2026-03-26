import { useParams, Link } from "react-router-dom";
import { GraduationCap, ShieldCheck, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "sonner";

const tierData: Record<string, { name: string; price: string; months: string; lessons: number; project: string; features: string[] }> = {
  intermediate: {
    name: "O'rta bosqich",
    price: "699,000 UZS",
    months: "3–6 oylar",
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
  advanced: {
    name: "Yuqori bosqich",
    price: "499,000 UZS",
    months: "7–9 oylar",
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
};

const paymentMethods = [
  { id: "payme", label: "Payme", color: "bg-[#00CCCC]" },
  { id: "click", label: "Click", color: "bg-[#00B4E6]" },
  { id: "uzcard", label: "Uzcard", color: "bg-[#1A932E]" },
  { id: "humo", label: "Humo", color: "bg-[#FF6B00]" },
];

const Checkout = () => {
  const { tier } = useParams();
  const data = tierData[tier || ""] || tierData.intermediate;
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const handlePurchase = () => {
    if (!selectedMethod) {
      toast.error("Iltimos, to'lov usulini tanlang");
      return;
    }
    toast.success("To'lov muvaffaqiyatli! Kurs ochildi.");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">
              on<span className="text-primary">dev</span>.uz
            </span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Xavfsiz to'lov
          </div>
        </div>
      </header>

      <div className="container px-4 py-10">
        <Button variant="ghost" size="sm" className="mb-6 gap-1" asChild>
          <Link to="/syllabus"><ArrowLeft className="w-4 h-4" /> Kurs dasturiga qaytish</Link>
        </Button>

        <div className="grid lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
          {/* Order Summary */}
          <div className="lg:col-span-3">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Buyurtma tafsilotlari</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{data.name}</h3>
                  <p className="text-sm text-muted-foreground">{data.months} · {data.lessons} ta dars</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">Tarkibiga kiradi:</p>
                  <ul className="space-y-1.5">
                    {data.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-secondary-foreground">
                        <Check className="w-4 h-4 text-primary shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Yakuniy loyiha</p>
                  <p className="font-medium">{data.project}</p>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Jami</span>
                  <span className="text-2xl font-bold text-primary">{data.price}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>To'lov usuli</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {paymentMethods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMethod(m.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      selectedMethod === m.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className={`w-10 h-7 rounded ${m.color} flex items-center justify-center`}>
                      <span className="text-xs font-bold text-white">{m.label.charAt(0)}</span>
                    </div>
                    <span className="font-medium text-sm">{m.label}</span>
                    {selectedMethod === m.id && (
                      <Check className="w-4 h-4 text-primary ml-auto" />
                    )}
                  </button>
                ))}
                <Button className="w-full mt-4" size="lg" onClick={handlePurchase}>
                  Xaridni yakunlash
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Xarid qilish orqali siz foydalanish shartlariga rozilik bildirasiz
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
