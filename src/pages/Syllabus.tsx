import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Lock, CheckCircle2, PlayCircle, Crown, ChevronDown, ChevronRight, BookOpen } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useCourses, useUserCourseAccess, getActiveCourseSlug, setActiveCourseSlug } from "@/hooks/useCourses";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface DBModule {
  id: number;
  month: number;
  tier: string;
  title: string;
  sort_order: number;
  course_id: string;
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
  const { courses } = useCourses({ onlyPublished: true });
  const { getTier } = useUserCourseAccess();
  const [selectedSlug, setSelectedSlug] = useState<string>(getActiveCourseSlug());
  const activeCourse = courses.find((c) => c.slug === selectedSlug) || courses[0];

  const [modules, setModules] = useState<DBModule[]>([]);
  const [lessons, setLessons] = useState<DBLesson[]>([]);
  const [expandedModules, setExpandedModules] = useState<number[]>([]);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  const courseTier = activeCourse ? getTier(activeCourse.id) || "free" : "free";

  useEffect(() => {
    if (!activeCourse) return;
    setActiveCourseSlug(activeCourse.slug);
    const fetchData = async () => {
      setLoading(true);
      const { data: mods } = await supabase
        .from("modules")
        .select("id, month, tier, title, sort_order, course_id")
        .eq("course_id", activeCourse.id)
        .order("sort_order");

      const moduleIds = (mods || []).map((m) => m.id);
      const { data: lsns } = moduleIds.length
        ? await supabase
            .from("lessons")
            .select("id, module_id, title, duration, sort_order, is_free")
            .in("module_id", moduleIds)
            .order("sort_order")
        : { data: [] };

      setModules(mods || []);
      setLessons(lsns || []);
      if (mods && mods.length > 0) setExpandedModules([mods[0].id]);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: progress } = await supabase
          .from("user_progress")
          .select("lesson_id")
          .eq("user_id", user.id)
          .eq("completed", true);
        if (progress) setCompletedLessons(new Set(progress.map((p) => p.lesson_id)));
      }
      setLoading(false);
    };
    fetchData();
  }, [activeCourse?.id]);

  const toggleModule = (id: number) =>
    setExpandedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );

  const tiers = ["basic", "intermediate", "advanced"];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container px-4 py-6 max-w-4xl">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
              {activeCourse?.icon} {activeCourse?.title || "Kurs dasturi"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {activeCourse?.description || ""} {lessons.length > 0 && `— ${lessons.length} ta dars`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedSlug} onValueChange={setSelectedSlug}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Kurs tanlang" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.slug}>
                    {c.icon} {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" asChild>
              <Link to="/courses"><BookOpen className="w-4 h-4 mr-1" /> Katalog</Link>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : modules.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Bu kurs uchun darslar hali tayyorlanmoqda.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {tiers.map((tierKey) => {
              const config = tierConfig[tierKey];
              const tierModules = modules.filter((m) => m.tier === tierKey);
              if (tierModules.length === 0) return null;
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
                      const isFree = mod.tier === "basic";
                      const isPremium = !isFree;
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
                            <div className="w-20 progress-bar-track h-1.5">
                              <div
                                className="progress-bar-fill"
                                style={{
                                  width: `${modLessons.length > 0 ? (completed / modLessons.length) * 100 : 0}%`,
                                }}
                              />
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
                                  {modLessons.map((lesson) => {
                                    const isCompleted = completedLessons.has(lesson.id);
                                    const allSorted = lessons.sort((a, b) => a.sort_order - b.sort_order);
                                    const globalIndex = allSorted.findIndex((l) => l.id === lesson.id);
                                    const prev = globalIndex > 0 ? allSorted[globalIndex - 1] : null;
                                    const sequenceUnlocked = isCompleted || globalIndex === 0 || (prev ? completedLessons.has(prev.id) : false);

                                    const tierOrder = ["free", "intermediate", "advanced"];
                                    const userIdx = tierOrder.indexOf(courseTier);
                                    const lessonIdx = tierOrder.indexOf(mod.tier === "basic" ? "free" : mod.tier);
                                    const hasTierAccess = userIdx >= lessonIdx;
                                    const isUnlocked = sequenceUnlocked && hasTierAccess;

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
                                          <span
                                            className="flex-1 text-sm text-muted-foreground cursor-pointer"
                                            onClick={() => {
                                              if (!hasTierAccess) {
                                                toast.error("Bu dars premium. To'lov qiling yoki admin bilan bog'laning.");
                                              } else {
                                                toast.info("Avval oldingi darsni yakunlang.");
                                              }
                                            }}
                                          >
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
        )}
      </main>
    </div>
  );
};

export default Syllabus;
