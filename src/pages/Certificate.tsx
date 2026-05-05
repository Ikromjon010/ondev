import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Download, Printer, ArrowLeft, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import CertificateCard from "@/components/CertificateCard";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface MyCert {
  id: string;
  credential_id: string;
  student_name: string;
  issued_at: string;
  course_id: string | null;
  course_title: string;
}

const Certificate = () => {
  const { user } = useAuth();
  const [certs, setCerts] = useState<MyCert[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("certificates")
        .select("id, credential_id, student_name, issued_at, course_id")
        .eq("user_id", user.id)
        .order("issued_at", { ascending: false });

      if (!data?.length) {
        setCerts([]);
        setLoading(false);
        return;
      }

      const courseIds = [...new Set(data.map((c) => c.course_id).filter(Boolean) as string[])];
      const { data: courses } = await supabase
        .from("courses")
        .select("id, title")
        .in("id", courseIds);
      const courseMap = new Map((courses || []).map((c) => [c.id, c.title]));

      setCerts(
        data.map((c) => ({
          ...c,
          course_title: (c.course_id && courseMap.get(c.course_id)) || "OnDev kursi",
        }))
      );
      setLoading(false);
    })();
  }, [user]);

  const downloadPDF = async () => {
    if (!cardRef.current) return;
    toast.loading("PDF tayyorlanmoqda...", { id: "pdf" });
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: "#ffffff" });
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(img, "PNG", 0, (pdf.internal.pageSize.getHeight() - pdfHeight) / 2, pdfWidth, pdfHeight);
      pdf.save(`ondev-sertifikat-${certs[activeIdx].credential_id}.pdf`);
      toast.success("PDF yuklandi", { id: "pdf" });
    } catch {
      toast.error("PDF yaratishda xatolik", { id: "pdf" });
    }
  };

  const active = certs[activeIdx];

  return (
    <div className="min-h-screen bg-background text-foreground">
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
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard" className="gap-1">
              <ArrowLeft className="w-4 h-4" /> Asosiy oyna
            </Link>
          </Button>
        </div>
      </header>

      <div className="container px-4 py-10 flex flex-col items-center">
        {loading ? (
          <p className="text-muted-foreground">Yuklanmoqda...</p>
        ) : certs.length === 0 ? (
          <div className="glass-card p-10 max-w-md w-full text-center">
            <Award className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h1 className="text-xl font-bold mb-2">Hali sertifikat yo'q</h1>
            <p className="text-sm text-muted-foreground mb-4">
              Kursni to'liq tugatganingizda sizga avtomatik sertifikat beriladi.
            </p>
            <Button asChild>
              <Link to="/dashboard">Darslarga qaytish</Link>
            </Button>
          </div>
        ) : (
          <>
            {certs.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {certs.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveIdx(i)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      i === activeIdx
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {c.course_title}
                  </button>
                ))}
              </div>
            )}

            <CertificateCard
              ref={cardRef}
              studentName={active.student_name}
              courseTitle={active.course_title}
              date={new Date(active.issued_at).toLocaleDateString("uz-UZ", {
                year: "numeric", month: "long", day: "numeric",
              })}
              credentialId={active.credential_id}
            />

            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Button className="gap-2" onClick={downloadPDF}>
                <Download className="w-4 h-4" /> PDF yuklab olish
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => window.print()}>
                <Printer className="w-4 h-4" /> Chop etish
              </Button>
              <Button variant="outline" className="gap-2" asChild>
                <Link to={`/certificate/${active.credential_id}`} target="_blank">
                  Tekshirish sahifasi
                </Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Sertifikat ID: <span className="font-mono">{active.credential_id}</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Certificate;
