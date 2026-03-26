import { Link } from "react-router-dom";
import { GraduationCap, Download, Linkedin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Certificate = () => {
  const studentName = "Sardor Rakhimov";
  const date = new Date().toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const credentialId = "ONDEV-2026-SR7X9K";

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
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard" className="gap-1">
              <ArrowLeft className="w-4 h-4" /> Asosiy oyna
            </Link>
          </Button>
        </div>
      </header>

      <div className="container px-4 py-10 flex flex-col items-center">
        {/* Certificate Card */}
        <div className="w-full max-w-3xl aspect-[1.414/1] rounded-xl overflow-hidden shadow-2xl border-2 border-primary/20 bg-gradient-to-br from-[hsl(220,14%,96%)] to-[hsl(220,14%,88%)]">
          <div className="w-full h-full flex flex-col items-center justify-center p-8 md:p-14 text-center relative">
            {/* Decorative borders */}
            <div className="absolute inset-4 border-2 border-[hsl(220,12%,75%)] rounded-lg pointer-events-none" />
            <div className="absolute inset-6 border border-[hsl(220,12%,82%)] rounded-lg pointer-events-none" />

            {/* Logo */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[hsl(160,84%,39%)] flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-[hsl(220,14%,20%)]">
                on<span className="text-[hsl(160,84%,39%)]">dev</span>.uz
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-[hsl(220,14%,15%)] tracking-tight mb-2">
              Yakunlash sertifikati
            </h1>
            <div className="w-24 h-0.5 bg-[hsl(160,84%,39%)] mx-auto mb-6" />

            <p className="text-sm text-[hsl(220,14%,40%)] mb-2">Ushbu sertifikat tasdiqlaydiki</p>
            <h2 className="text-2xl md:text-3xl font-bold text-[hsl(220,14%,10%)] mb-2 font-serif italic">
              {studentName}
            </h2>
            <p className="text-sm text-[hsl(220,14%,40%)] max-w-md mb-8 leading-relaxed">
              ondev.uz platformasida <strong className="text-[hsl(220,14%,15%)]">9 oylik Python & Django Backend Dasturlash Dasturi</strong>ni muvaffaqiyatli yakunladi
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              <div className="text-center">
                <p className="text-xs text-[hsl(220,14%,50%)] uppercase tracking-widest mb-1">Sana</p>
                <p className="font-semibold text-[hsl(220,14%,15%)]">{date}</p>
              </div>
              <div className="hidden sm:block w-px h-8 bg-[hsl(220,12%,75%)]" />
              <div className="text-center">
                <p className="text-xs text-[hsl(220,14%,50%)] uppercase tracking-widest mb-1">Sertifikat ID</p>
                <p className="font-mono text-sm font-semibold text-[hsl(220,14%,15%)]">{credentialId}</p>
              </div>
            </div>

            {/* Mock QR code */}
            <div className="w-16 h-16 rounded bg-[hsl(220,14%,15%)] grid grid-cols-4 grid-rows-4 gap-px p-1">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-sm ${
                    [0, 1, 3, 4, 5, 7, 8, 11, 12, 14, 15].includes(i)
                      ? "bg-white"
                      : "bg-transparent"
                  }`}
                />
              ))}
            </div>
            <p className="text-[10px] text-[hsl(220,14%,50%)] mt-1">Tekshirish uchun skanerlang</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-8">
          <Button className="gap-2" onClick={() => window.print()}>
            <Download className="w-4 h-4" /> PDF yuklab olish
          </Button>
          <Button variant="outline" className="gap-2" asChild>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://ondev.uz/certificate/" + credentialId)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin className="w-4 h-4" /> LinkedIn da ulashish
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
