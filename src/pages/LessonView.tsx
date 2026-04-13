import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, ArrowLeft, BookOpen, Video, Terminal } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { awardPoints } from "@/hooks/useGamification";
import CelebrationOverlay from "@/components/CelebrationOverlay";
import PracticeTasks from "@/components/PracticeTasks";

const LessonView = () => {
  const { user, isAdmin } = useAuth();
  const { id } = useParams();
  const lessonId = parseInt(id || "1");

  const [lesson, setLesson] = useState<{
    title: string;
    content_md: string | null;
    starter_code: string | null;
    solution_code: string | null;
    video_url: string | null;
    duration: string | null;
    sort_order: number;
  } | null>(null);
  const [totalLessons, setTotalLessons] = useState(108);
  const [loading, setLoading] = useState(true);

  const [output, setOutput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<"video" | "theory" | "practice">("video");

  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState({
    points: 0,
    streak: 0,
    badges: [] as { name: string; icon: string; description: string }[],
  });

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      setSubmitted(false);
      setOutput("");

      const [{ data: lessonData }, { count }] = await Promise.all([
        supabase
          .from("lessons")
          .select("title, content_md, starter_code, solution_code, video_url, duration, sort_order")
          .eq("id", lessonId)
          .single(),
        supabase.from("lessons").select("id", { count: "exact", head: true }),
      ]);

      if (user) {
        const { data: progress } = await supabase
          .from("user_progress")
          .select("completed")
          .eq("user_id", user.id)
          .eq("lesson_id", lessonId)
          .single();
        if (progress?.completed) setSubmitted(true);
      }

      setLesson(lessonData);
      setTotalLessons(count || 108);
      setLoading(false);
    };
    fetchLesson();
  }, [lessonId, user]);

  const handleRun = (code: string) => {
    setRunning(true);
    setTimeout(() => {
      setOutput("✓ Kod muvaffaqiyatli ishga tushirildi!");
      setRunning(false);
    }, 1500);
  };

  const handleSubmit = async (code: string, taskIndex: number, totalTasks: number) => {
    if (!user) return;
    setRunning(true);

    try {
      const pointsPerTask = totalTasks > 0 ? Math.round(50 / totalTasks) : 50;
      const isLastTask = taskIndex === totalTasks - 1 || totalTasks === 0;

      const result = await awardPoints(user.id, lessonId, code, pointsPerTask);
      setOutput(
        `✅ Topshiriq ${taskIndex + 1} qabul qilindi! +${result.pointsEarned} ball\nJami ballar: ${result.totalPoints}`
      );

      if (isLastTask) {
        setSubmitted(true);
        setCelebrationData({
          points: result.pointsEarned,
          streak: result.newStreak,
          badges: result.newBadges,
        });
        setShowCelebration(true);
      }
    } catch {
      setOutput("❌ Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    }
    setRunning(false);
  };

  const closeCelebration = useCallback(() => setShowCelebration(false), []);

  const tabs = [
    { key: "video" as const, label: "Video dars", icon: Video },
    { key: "theory" as const, label: "Nazariya", icon: BookOpen },
    { key: "practice" as const, label: "Amaliyot", icon: Terminal },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader />
        <main className="container px-4 py-6">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-96 w-full rounded-lg" />
        </main>
      </div>
    );
  }

  const lessonTitle = lesson?.title || "Dars";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <CelebrationOverlay
        show={showCelebration}
        points={celebrationData.points}
        streak={celebrationData.streak}
        badges={celebrationData.badges}
        onClose={closeCelebration}
      />

      <div className="border-b border-border bg-card/50">
        <div className="container px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/syllabus" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <p className="text-xs text-muted-foreground">{totalLessons} dan {lesson?.sort_order || lessonId}-dars</p>
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
                <p className="text-sm text-muted-foreground mt-1">
                  {lesson?.video_url ? "Video mavjud" : "Video tayyorlanmoqda"} • {lesson?.duration || "15min"}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "theory" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
            <div className="glass-card p-6 markdown-content">
              {lesson?.content_md ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {(() => {
                    if (isAdmin) return lesson.content_md;
                    const studentMatch = lesson.content_md.match(/#{1,3}\s*📚\s*STUDENT KONSPEKTI[\s\S]*/i);
                    return studentMatch ? studentMatch[0] : lesson.content_md;
                  })()}
                </ReactMarkdown>
              ) : (
                <p className="text-muted-foreground italic">Nazariya kontenti tayyorlanmoqda...</p>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "practice" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <PracticeTasks
              contentMd={lesson?.content_md || null}
              starterCode={lesson?.starter_code || null}
              lessonId={lessonId}
              submitted={submitted}
              running={running}
              output={output}
              onRun={handleRun}
              onSubmit={handleSubmit}
            />
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default LessonView;
