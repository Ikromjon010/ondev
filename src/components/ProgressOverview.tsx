import { currentUser } from "@/data/courseData";
import { motion } from "framer-motion";
import { BookOpen, Code2, Rocket, Target } from "lucide-react";

const ProgressOverview = () => {
  const progress = Math.round((currentUser.completedLessons / currentUser.totalLessons) * 100);

  const milestones = [
    { name: "To-Do List App", month: 2, lesson: 24, icon: BookOpen, done: false },
    { name: "E-commerce Backend", month: 6, lesson: 72, icon: Code2, done: false },
    { name: "Real-time Chat", month: 9, lesson: 108, icon: Rocket, done: false },
  ];

  return (
    <div className="flex-1 space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {currentUser.name.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Continue your Python & Django journey</p>
      </motion.div>

      {/* Overall Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-accent" />
            <h2 className="font-semibold text-foreground">Overall Progress</h2>
          </div>
          <span className="text-sm text-muted-foreground">
            {currentUser.completedLessons}/{currentUser.totalLessons} lessons
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
          <span>Month 1</span>
          <span>{progress}% complete</span>
          <span>Month 9</span>
        </div>

        {/* Milestones */}
        <div className="grid grid-cols-3 gap-4 mt-5">
          {milestones.map((m, i) => {
            const reached = currentUser.completedLessons >= m.lesson;
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
                <p className="text-[10px] text-muted-foreground mt-0.5">Month {m.month}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Current Module", value: "Adv. Python Basics", sub: "Month 2" },
          { label: "Next Lesson", value: "Decorators", sub: "Lesson 20 of 108" },
          { label: "Time Invested", value: "42 hrs", sub: "This month: 8 hrs" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="glass-card p-4"
          >
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="font-semibold text-foreground mt-1">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.sub}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProgressOverview;
