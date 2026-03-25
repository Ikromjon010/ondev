import { useParams, Link } from "react-router-dom";
import { GraduationCap, ShieldCheck, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "sonner";

const tierData: Record<string, { name: string; price: string; months: string; lessons: number; project: string; features: string[] }> = {
  intermediate: {
    name: "Intermediate Tier",
    price: "699,000 UZS",
    months: "Months 3–6",
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
  advanced: {
    name: "Advanced Tier",
    price: "499,000 UZS",
    months: "Months 7–9",
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
      toast.error("Please select a payment method");
      return;
    }
    toast.success("Payment successful! Course unlocked.");
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
            Secure Checkout
          </div>
        </div>
      </header>

      <div className="container px-4 py-10">
        <Button variant="ghost" size="sm" className="mb-6 gap-1" asChild>
          <Link to="/syllabus"><ArrowLeft className="w-4 h-4" /> Back to Syllabus</Link>
        </Button>

        <div className="grid lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
          {/* Order Summary */}
          <div className="lg:col-span-3">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{data.name}</h3>
                  <p className="text-sm text-muted-foreground">{data.months} · {data.lessons} lessons</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">What's included:</p>
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
                  <p className="text-sm text-muted-foreground mb-1">Capstone Project</p>
                  <p className="font-medium">{data.project}</p>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">{data.price}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
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
                  Complete Purchase
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  By purchasing you agree to our Terms of Service
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
