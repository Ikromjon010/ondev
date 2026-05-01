import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const languageNames: Record<string, string> = {
  python: "Python",
  javascript: "JavaScript",
  typescript: "TypeScript",
  dart: "Dart",
  java: "Java",
  go: "Go",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { taskDescription, studentCode, language } = await req.json();
    const lang = (language || "python").toLowerCase();
    const langName = languageNames[lang] || "Python";

    if (!taskDescription || !studentCode?.trim()) {
      return new Response(
        JSON.stringify({
          correct: false,
          feedback: "Kod bo'sh. Iltimos, yechimingizni yozing.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `Sen ${langName} o'qituvchisisan. Talaba topshiriq yechimini yubordi.
Topshiriq tavsifi va talaba kodi beriladi.

MUHIM QOIDALAR:
- Talaba kodi topshiriqdagi BARCHA talablarni bajarishi kerak
- Agar kodda faqat kommentariylar bo'lsa va hech qanday amaliy kod yozilmagan bo'lsa — bu NOTO'G'RI
- Agar topshiriqda 3 ta ish bo'lsa, hammasi bajarilishi kerak
- Faqat amaliy ${langName} kodi hisoblangan (o'zgaruvchilar, funksiyalar, chiqarish va h.k.)

Javobni FAQAT JSON formatda ber:
{"correct": true/false, "feedback": "qisqa izoh uzbek tilida"}`;

    const userPrompt = `TOPSHIRIQ:\n${taskDescription}\n\nTALABA KODI:\n\`\`\`${lang}\n${studentCode}\n\`\`\``;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ correct: false, feedback: "Juda ko'p so'rov. Biroz kuting." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    const jsonMatch = content.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ correct: false, feedback: "Tekshirishda xatolik. Qaytadan urinib ko'ring." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("check-code error:", e);
    return new Response(
      JSON.stringify({ correct: false, feedback: "Server xatoligi. Qaytadan urinib ko'ring." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
