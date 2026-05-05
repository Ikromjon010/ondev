import { forwardRef } from "react";
import { GraduationCap } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface CertificateCardProps {
  studentName: string;
  courseTitle: string;
  date: string;
  credentialId: string;
}

const CertificateCard = forwardRef<HTMLDivElement, CertificateCardProps>(
  ({ studentName, courseTitle, date, credentialId }, ref) => {
    const verifyUrl = `${typeof window !== "undefined" ? window.location.origin : "https://ondev.uz"}/certificate/${credentialId}`;

    return (
      <div
        ref={ref}
        className="w-full max-w-3xl aspect-[1.414/1] rounded-xl overflow-hidden shadow-2xl border-2 border-primary/20 bg-gradient-to-br from-[hsl(220,14%,96%)] to-[hsl(220,14%,88%)]"
      >
        <div className="w-full h-full flex flex-col items-center justify-center p-8 md:p-14 text-center relative">
          <div className="absolute inset-4 border-2 border-[hsl(220,12%,75%)] rounded-lg pointer-events-none" />
          <div className="absolute inset-6 border border-[hsl(220,12%,82%)] rounded-lg pointer-events-none" />

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
            ondev.uz platformasida{" "}
            <strong className="text-[hsl(220,14%,15%)]">{courseTitle}</strong> kursini
            muvaffaqiyatli yakunladi
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

          <div className="bg-white p-1.5 rounded">
            <QRCodeSVG value={verifyUrl} size={64} level="M" />
          </div>
          <p className="text-[10px] text-[hsl(220,14%,50%)] mt-1">Tekshirish uchun skanerlang</p>
        </div>
      </div>
    );
  }
);

CertificateCard.displayName = "CertificateCard";
export default CertificateCard;
