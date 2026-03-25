import { useState } from "react";
import { Link } from "react-router-dom";
import { Lock, Unlock, CheckCircle2, PlayCircle, Crown, ChevronDown, ChevronRight } from "lucide-react";
import { tiers } from "@/data/courseData";
import AppHeader from "@/components/AppHeader";
import { motion, AnimatePresence } from "framer-motion";

const Syllabus = () => {
  const [expandedModules, setExpandedModules] = useState<number[]>([1, 2]);

  const toggleModule = (id: number) =>
    setExpandedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container px-4 py-6 max-w-4xl">
        <h1 className="text-2xl font-bold text-foreground mb-1">Course Syllabus</h1>
        <p className="text-muted-foreground mb-6">
          9-month Python & Django Backend Development Program
        </p>

        <div className="space-y-8">
          {tiers.map((tier) => (
            <div key={tier.name}>
              <div className="flex items-center gap-3 mb-4">
                <span className={`tier-badge-${tier.badge}`}>{tier.name}</span>
                <span className="text-sm text-muted-foreground">{tier.months}</span>
                <span className="text-xs text-muted-foreground">• {tier.totalLessons} lessons</span>
              </div>

              <div className="space-y-3">
                {tier.modules.map((mod) => {
                  const isFree = mod.month === 1;
                  const isPremium = mod.month > 1;
                  const expanded = expandedModules.includes(mod.id);
                  const completed = mod.lessons.filter((l) => l.completed).length;

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
                                Month {mod.month}: {mod.title}
                              </h3>
                              {isFree && (
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-primary/20 text-primary">
                                  Free
                                </span>
                              )}
                              {isPremium && (
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-warning/20 text-warning flex items-center gap-1">
                                  <Crown className="w-3 h-3" /> Premium: 299,000 UZS
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {completed}/{mod.lessons.length} completed
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 progress-bar-track h-1.5">
                            <div
                              className="progress-bar-fill"
                              style={{ width: `${(completed / mod.lessons.length) * 100}%` }}
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
                              {mod.lessons.map((lesson) => (
                                <div
                                  key={lesson.id}
                                  className={`flex items-center gap-3 px-4 py-2.5 border-b border-border/30 last:border-0 ${
                                    lesson.unlocked ? "lesson-unlocked" : "lesson-locked"
                                  }`}
                                >
                                  {lesson.completed ? (
                                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                  ) : lesson.unlocked ? (
                                    <PlayCircle className="w-4 h-4 text-accent shrink-0" />
                                  ) : (
                                    <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                                  )}
                                  {lesson.unlocked ? (
                                    <Link
                                      to={`/lesson/${lesson.id}`}
                                      className="flex-1 text-sm text-foreground hover:text-accent transition-colors"
                                    >
                                      {lesson.id}. {lesson.title}
                                    </Link>
                                  ) : (
                                    <span className="flex-1 text-sm text-muted-foreground">
                                      {lesson.id}. {lesson.title}
                                    </span>
                                  )}
                                  <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                                  {!lesson.unlocked && (
                                    <Lock className="w-3 h-3 text-muted-foreground" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Syllabus;
