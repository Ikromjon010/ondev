import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, CheckCircle2, ArrowRight, ArrowLeft, Terminal, BookOpen, Video } from "lucide-react";
import { sampleLessonContent, sampleCode, tiers } from "@/data/courseData";
import AppHeader from "@/components/AppHeader";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Editor from "@monaco-editor/react";
import { motion } from "framer-motion";

const LessonView = () => {
  const { id } = useParams();
  const lessonId = parseInt(id || "2");

  // Find lesson info
  const allLessons = tiers.flatMap((t) => t.modules.flatMap((m) => m.lessons));
  const lesson = allLessons.find((l) => l.id === lessonId);
  const lessonTitle = lesson?.title || "Variables & Data Types";

  const [code, setCode] = useState(sampleCode);
  const [output, setOutput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<"video" | "theory" | "practice">("video");

  const handleRun = () => {
    setRunning(true);
    setTimeout(() => {
      setOutput(
        `Student: Ali\nAge: 20\nGPA: 3.6\nPercentage: 90.0%\n\n✓ Barcha testlar muvaffaqiyatli o'tdi!`
      );
      setRunning(false);
    }, 1500);
  };

  const handleSubmit = () => {
    setRunning(true);
    setTimeout(() => {
      setOutput(
        `Student: Ali\nAge: 20\nGPA: 3.6\nPercentage: 90.0%\n\n✅ Qabul qilindi! +50 ball\nBarcha 3 ta test muvaffaqiyatli o'tdi.`
      );
      setSubmitted(true);
      setRunning(false);
    }, 2000);
  };

  const tabs = [
    { key: "video" as const, label: "Video dars", icon: Video },
    { key: "theory" as const, label: "Nazariya", icon: BookOpen },
    { key: "practice" as const, label: "Amaliyot", icon: Terminal },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />

      {/* Lesson Header */}
      <div className="border-b border-border bg-card/50">
        <div className="container px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/syllabus" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <p className="text-xs text-muted-foreground">108 dan {lessonId}-dars</p>
              <h1 className="font-semibold text-foreground">{lessonTitle}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 container px-4 py-4">
        {activeTab === "video" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
            <div className="glass-card aspect-video flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
              <div className="text-center relative z-10">
                <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-accent/30 transition-colors glow-accent">
                  <Play className="w-8 h-8 text-accent ml-1" />
                </div>
                <p className="text-foreground font-medium">{lessonTitle}</p>
                <p className="text-sm text-muted-foreground mt-1">HLS Video oqimi • 18:32</p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "theory" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
            <div className="glass-card p-6 markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {sampleLessonContent}
              </ReactMarkdown>
            </div>
          </motion.div>
        )}

        {activeTab === "practice" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-180px)]">
            {/* Editor */}
            <div className="glass-card flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-foreground">solution.py</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleRun}
                    disabled={running}
                    className="px-3 py-1 text-xs font-medium rounded bg-secondary text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
                  >
                    {running ? "Ishlamoqda..." : "▶ Ishga tushirish"}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={running || submitted}
                    className="px-3 py-1 text-xs font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {submitted ? "✓ Yuborildi" : "Tekshirish uchun yuborish"}
                  </button>
                </div>
              </div>
              <div className="flex-1">
                <Editor
                  height="100%"
                  defaultLanguage="python"
                  value={code}
                  onChange={(v) => setCode(v || "")}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', monospace",
                    padding: { top: 12 },
                    scrollBeyondLastLine: false,
                    lineNumbers: "on",
                    renderLineHighlight: "line",
                    automaticLayout: true,
                  }}
                />
              </div>
            </div>

            {/* Output */}
            <div className="glass-card flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
                <Terminal className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Natija</span>
              </div>
              <div className="flex-1 p-4 font-mono text-sm overflow-auto">
                {output ? (
                  <pre className="text-foreground whitespace-pre-wrap">{output}</pre>
                ) : (
                  <p className="text-muted-foreground italic">
                    Natijani ko'rish uchun kodingizni ishga tushiring...
                  </p>
                )}
              </div>

              {/* Next Lesson */}
              <div className="border-t border-border p-4">
                <button
                  disabled={!submitted}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all ${
                    submitted
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 glow-success"
                      : "bg-secondary text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  {submitted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Keyingi dars
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Keyingi darsni ochish uchun kodni yuboring</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default LessonView;
