import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Code2, Rocket, Target, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentLesson } from "@/hooks/useCurrentLesson";

const ProgressOverview = () => {
  const { user, profile } = useAuth();
  const { currentLessonId } = useCurrentLesson();
  const [completedCount, setCompletedCount] = useState(0);
  const [totalLessons, setTotalLessons] = useState(108);
  const [currentLessonTitle, setCurrentLessonTitle] = useState("");
  const [currentModuleTitle, setCurrentModuleTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [{ count: total }, progressResult] = await Promise.all([
        supabase.from("lessons").select("id", { count: "exact", head: true }),
        user
          ? supabase
              .from("user_progress")
              .select("id", { count: "exact", head: true })
              .eq("user_id", user.id)
              .eq("completed", true)
          : Promise.resolve({ count: 0 }),
      ]);
      setTotalLessons(total || 108);
      setCompletedCount(progressResult.count || 0);

      // Fetch current lesson info
      if (currentLessonId) {
        const { data: lessonData } = await supabase
          .from("lessons")
          .select("title, module_id")
          .eq("id", currentLessonId)
          .single();
        if (lessonData) {
          setCurrentLessonTitle(lessonData.title);
          const { data: moduleData } = await supabase
            .from("modules")
            .select("title")
            .eq("id", lessonData.module_id)
            .single();
          if (moduleData) setCurrentModuleTitle(moduleData.title);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [user, currentLessonId]);

  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const firstName = profile?.full_name?.split(" ")[0] || "Foydalanuvchi";

  const milestones = [
    { name: "To-Do List Ilovasi", month: 2, lesson: 24, icon: BookOpen },
    { name: "E-commerce Backend", month: 6, lesson: 72, icon: Code2 },
    { name: "Real-time Chat", month: 9, lesson: 108, icon: Rocket },
  ];

  if (loading) {
    return (
      <div className="flex-1 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">
          Qaytganingiz bilan, {firstName} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Python & Django yo'lingizni davom ettiring</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-accent" />
            <h2 className="font-semibold text-foreground">Umumiy natija</h2>
          </div>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{totalLessons} dars
          </span>
        </div>
        <div className="progress-bar-track h-4">
          <motion.div
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>1-oy</span>
          <span>{progress}% yakunlandi</span>
          <span>9-oy</span>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-5">
          {milestones.map((m, i) => {
            const reached = completedCount >= m.lesson;
            return (
              <div
                key={i}
                className={`rounded-lg p-3 text-center border ${
                  reached
                    ? "border-primary/40 bg-primary/5"
                    : "border-border/50 bg-secondary/30"
                }`}
              >
                <m.icon className={`w-5 h-5 mx-auto mb-1 ${reached ? "text-primary" : "text-muted-foreground"}`} />
                <p className={`text-xs font-medium ${reached ? "text-primary" : "text-muted-foreground"}`}>
                  {m.name}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{m.month}-oy</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Current lesson card */}
      {currentLessonTitle && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link
            to={`/lesson/${currentLessonId}`}
            className="glass-card p-4 flex items-center justify-between group hover:border-primary/30 transition-colors block"
          >
            <div>
              <p className="text-xs text-muted-foreground">Joriy dars</p>
              <p className="font-semibold text-foreground mt-1 text-sm">{currentLessonTitle}</p>
              <p className="text-xs text-muted-foreground">{currentModuleTitle}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        </motion.div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Joriy modul", value: currentModuleTitle || "—", sub: "" },
          { label: "Keyingi dars", value: `${currentLessonId}-dars`, sub: `${totalLessons} ta dars` },
          { label: "Yakunlangan", value: `${completedCount} dars`, sub: `${totalLessons} dan` },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="glass-card p-4"
          >
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="font-semibold text-foreground mt-1 text-sm truncate">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.sub}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProgressOverview;
