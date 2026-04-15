import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Lock, CheckCircle2, PlayCircle, Crown, ChevronDown, ChevronRight } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface DBModule {
  id: number;
  month: number;
  tier: string;
  title: string;
  sort_order: number;
}

interface DBLesson {
  id: number;
  module_id: number;
  title: string;
  duration: string | null;
  sort_order: number;
  is_free: boolean;
}

const tierConfig: Record<string, { name: string; months: string; badge: string }> = {
  basic: { name: "🟢 Basic", months: "1-2 oy", badge: "basic" },
  intermediate: { name: "🟡 Intermediate", months: "3-6 oy", badge: "intermediate" },
  advanced: { name: "🔴 Advanced", months: "7-9 oy", badge: "advanced" },
};

const Syllabus = () => {
  const [modules, setModules] = useState<DBModule[]>([]);
  const [lessons, setLessons] = useState<DBLesson[]>([]);
  const [expandedModules, setExpandedModules] = useState<number[]>([]);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: mods }, { data: lsns }] = await Promise.all([
        supabase.from("modules").select("id, month, tier, title, sort_order").order("sort_order"),
        supabase.from("lessons").select("id, module_id, title, duration, sort_order, is_free").order("sort_order"),
      ]);

      setModules(mods || []);
      setLessons(lsns || []);
      if (mods && mods.length > 0) {
        setExpandedModules([mods[0].id]);
      }

      // Fetch user progress if logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: progress } = await supabase
          .from("user_progress")
          .select("lesson_id")
          .eq("user_id", user.id)
          .eq("completed", true);
        if (progress) {
          setCompletedLessons(new Set(progress.map((p) => p.lesson_id)));
        }
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  const toggleModule = (id: number) =>
    setExpandedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );

  const tiers = ["basic", "intermediate", "advanced"];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container px-4 py-6 max-w-4xl space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container px-4 py-6 max-w-4xl">
        <h1 className="text-2xl font-bold text-foreground mb-1">Kurs dasturi</h1>
        <p className="text-muted-foreground mb-6">
          9 oylik Python & Django Backend Dasturlash Dasturi — {lessons.length} ta dars
        </p>

        <div className="space-y-8">
          {tiers.map((tierKey) => {
            const config = tierConfig[tierKey];
            const tierModules = modules.filter((m) => m.tier === tierKey);
            const tierLessons = lessons.filter((l) =>
              tierModules.some((m) => m.id === l.module_id)
            );

            return (
              <div key={tierKey}>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`tier-badge-${config.badge}`}>{config.name}</span>
                  <span className="text-sm text-muted-foreground">{config.months}</span>
                  <span className="text-xs text-muted-foreground">• {tierLessons.length} ta dars</span>
                </div>

                <div className="space-y-3">
                  {tierModules.map((mod) => {
                    const modLessons = lessons
                      .filter((l) => l.module_id === mod.id)
                      .sort((a, b) => a.sort_order - b.sort_order);
                    const isFree = mod.month === 1;
                    const isPremium = mod.month > 1;
                    const expanded = expandedModules.includes(mod.id);
                    const completed = modLessons.filter((l) => completedLessons.has(l.id)).length;

                    return (
                      <div key={mod.id} className="glass-card overflow-hidden">
                        <button
                          onClick={() => toggleModule(mod.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {expanded ? (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                            <div className="text-left">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-foreground">
                                  {mod.month}-oy: {mod.title}
                                </h3>
                                {isFree && (
                                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-primary/20 text-primary">
                                    Bepul
                                  </span>
                                )}
                                {isPremium && (
                                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-warning/20 text-warning flex items-center gap-1">
                                    <Crown className="w-3 h-3" /> Premium
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {completed}/{modLessons.length} yakunlandi
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-20 progress-bar-track h-1.5">
                              <div
                                className="progress-bar-fill"
                                style={{
                                  width: `${modLessons.length > 0 ? (completed / modLessons.length) * 100 : 0}%`,
                                }}
                              />
                            </div>
                          </div>
                        </button>

                        <AnimatePresence>
                          {expanded && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: "auto" }}
                              exit={{ height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-border">
                                {modLessons.map((lesson, lessonIndex) => {
                                  const isCompleted = completedLessons.has(lesson.id);
                                  // Unlock if: first lesson of first module, or previous lesson completed, or lesson itself completed
                                  const allSortedLessons = lessons.sort((a, b) => a.sort_order - b.sort_order);
                                  const globalIndex = allSortedLessons.findIndex((l) => l.id === lesson.id);
                                  const prevLesson = globalIndex > 0 ? allSortedLessons[globalIndex - 1] : null;
                                  const isUnlocked = isCompleted || globalIndex === 0 || (prevLesson ? completedLessons.has(prevLesson.id) : false);

                                  return (
                                    <div
                                      key={lesson.id}
                                      className={`flex items-center gap-3 px-4 py-2.5 border-b border-border/30 last:border-0 ${
                                        isUnlocked ? "lesson-unlocked" : "lesson-locked"
                                      }`}
                                    >
                                      {isCompleted ? (
                                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                      ) : isUnlocked ? (
                                        <PlayCircle className="w-4 h-4 text-accent shrink-0" />
                                      ) : (
                                        <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                                      )}
                                      {isUnlocked ? (
                                        <Link
                                          to={`/lesson/${lesson.id}`}
                                          className="flex-1 text-sm text-foreground hover:text-accent transition-colors"
                                        >
                                          {lesson.title}
                                        </Link>
                                      ) : (
                                        <span className="flex-1 text-sm text-muted-foreground">
                                          {lesson.title}
                                        </span>
                                      )}
                                      <span className="text-xs text-muted-foreground">
                                        {lesson.duration || "15min"}
                                      </span>
                                      {!isUnlocked && (
                                        <Lock className="w-3 h-3 text-muted-foreground" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Syllabus;
