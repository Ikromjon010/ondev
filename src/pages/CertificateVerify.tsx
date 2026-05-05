import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { GraduationCap, ShieldCheck, ShieldX, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import CertificateCard from "@/components/CertificateCard";

interface CertData {
  student_name: string;
  credential_id: string;
  issued_at: string;
  course_title: string;
}

const CertificateVerify = () => {
  const { credentialId } = useParams();
  const [loading, setLoading] = useState(true);
  const [cert, setCert] = useState<CertData | null>(null);

  useEffect(() => {
    if (!credentialId) return;
    (async () => {
      const { data } = await supabase
        .from("certificates")
        .select("student_name, credential_id, issued_at, course_id")
        .eq("credential_id", credentialId)
        .maybeSingle();

      if (!data) {
        setCert(null);
        setLoading(false);
        return;
      }

      let courseTitle = "OnDev kursi";
      if (data.course_id) {
        const { data: course } = await supabase
          .from("courses")
          .select("title")
          .eq("id", data.course_id)
          .maybeSingle();
        if (course?.title) courseTitle = course.title;
      }

      setCert({
        student_name: data.student_name,
        credential_id: data.credential_id,
        issued_at: data.issued_at,
        course_title: courseTitle,
      });
      setLoading(false);
    })();
  }, [credentialId]);

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
            <Link to="/" className="gap-1">
              <ArrowLeft className="w-4 h-4" /> Bosh sahifa
            </Link>
          </Button>
        </div>
      </header>

      <div className="container px-4 py-10 flex flex-col items-center">
        {loading ? (
          <p className="text-muted-foreground">Tekshirilmoqda...</p>
        ) : !cert ? (
          <div className="glass-card p-10 max-w-md w-full text-center">
            <ShieldX className="w-12 h-12 text-destructive mx-auto mb-3" />
            <h1 className="text-xl font-bold mb-2">Sertifikat topilmadi</h1>
            <p className="text-sm text-muted-foreground mb-4">
              Berilgan ID bo'yicha sertifikat mavjud emas: <span className="font-mono">{credentialId}</span>
            </p>
            <Button asChild variant="outline">
              <Link to="/">Bosh sahifaga qaytish</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/15 border border-primary/30">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Tasdiqlangan sertifikat</span>
            </div>
            <CertificateCard
              studentName={cert.student_name}
              courseTitle={cert.course_title}
              date={new Date(cert.issued_at).toLocaleDateString("uz-UZ", {
                year: "numeric", month: "long", day: "numeric",
              })}
              credentialId={cert.credential_id}
            />
            <p className="text-xs text-muted-foreground mt-6 text-center max-w-md">
              Bu sertifikat ondev.uz tomonidan rasmiy ravishda berilgan va haqiqiyligi tasdiqlangan.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default CertificateVerify;
