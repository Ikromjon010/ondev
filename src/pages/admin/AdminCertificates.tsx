import { useEffect, useState } from "react";
import { Award, Eye, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import CertificateCard from "@/components/CertificateCard";

interface Row {
  id: string;
  credential_id: string;
  student_name: string;
  issued_at: string;
  user_id: string;
  course_id: string | null;
  course_title: string;
}

const AdminCertificates = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<Row | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("certificates")
        .select("id, credential_id, student_name, issued_at, user_id, course_id")
        .order("issued_at", { ascending: false });

      const courseIds = [...new Set((data || []).map((c) => c.course_id).filter(Boolean) as string[])];
      const { data: courses } = courseIds.length
        ? await supabase.from("courses").select("id, title").in("id", courseIds)
        : { data: [] as { id: string; title: string }[] };
      const courseMap = new Map((courses || []).map((c) => [c.id, c.title]));

      setRows(
        (data || []).map((r) => ({
          ...r,
          course_title: (r.course_id && courseMap.get(r.course_id)) || "OnDev kursi",
        }))
      );
      setLoading(false);
    })();
  }, []);

  const filtered = rows.filter(
    (r) =>
      r.student_name.toLowerCase().includes(search.toLowerCase()) ||
      r.credential_id.toLowerCase().includes(search.toLowerCase()) ||
      r.course_title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            Sertifikatlar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Barcha berilgan sertifikatlar ro'yxati va namunalari
          </p>
        </div>
        <div className="text-sm text-muted-foreground">Jami: {rows.length}</div>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Ism, ID yoki kurs bo'yicha qidirish..."
        className="w-full max-w-md px-3 py-2 mb-4 rounded-lg border border-border bg-background text-sm"
      />

      {loading ? (
        <p className="text-muted-foreground">Yuklanmoqda...</p>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <Award className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Hali sertifikatlar berilmagan</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">O'quvchi</th>
                <th className="px-4 py-3 font-medium">Kurs</th>
                <th className="px-4 py-3 font-medium">Sertifikat ID</th>
                <th className="px-4 py-3 font-medium">Sana</th>
                <th className="px-4 py-3 font-medium text-right">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-secondary/20">
                  <td className="px-4 py-3 font-medium">{r.student_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.course_title}</td>
                  <td className="px-4 py-3 font-mono text-xs">{r.credential_id}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(r.issued_at).toLocaleDateString("uz-UZ")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" className="gap-1" onClick={() => setPreview(r)}>
                      <Eye className="w-4 h-4" /> Ko'rish
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {preview && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-auto"
          onClick={() => setPreview(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreview(null)}
              className="absolute -top-2 -right-2 z-10 w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center hover:bg-secondary"
              aria-label="Yopish"
            >
              <X className="w-4 h-4" />
            </button>
            <CertificateCard
              studentName={preview.student_name}
              courseTitle={preview.course_title}
              date={new Date(preview.issued_at).toLocaleDateString("uz-UZ", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              credentialId={preview.credential_id}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCertificates;
