import { Trophy, Flame, Star, TrendingUp } from "lucide-react";
import { leaderboard, currentUser } from "@/data/courseData";
import { motion } from "framer-motion";

const GamificationSidebar = () => {
  return (
    <aside className="w-80 shrink-0 space-y-5">
      {/* User Profile Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-card p-5"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
            {currentUser.avatar}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{currentUser.name}</h3>
            <p className="text-sm text-muted-foreground">Python Learner</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary rounded-lg p-3 text-center">
            <Star className="w-4 h-4 text-warning mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{currentUser.points}</p>
            <p className="text-xs text-muted-foreground">Points</p>
          </div>
          <div className="bg-secondary rounded-lg p-3 text-center">
            <Flame className="w-4 h-4 text-destructive mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{currentUser.streak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
        </div>
      </motion.div>

      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-warning" />
          <h3 className="font-semibold text-foreground">Leaderboard</h3>
        </div>
        <div className="space-y-2">
          {leaderboard.map((user) => (
            <div
              key={user.rank}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                user.name === currentUser.name
                  ? "bg-primary/10 border border-primary/30"
                  : "hover:bg-secondary/50"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  user.rank === 1
                    ? "bg-warning text-warning-foreground"
                    : user.rank === 2
                    ? "bg-muted-foreground/30 text-foreground"
                    : user.rank === 3
                    ? "bg-warning/40 text-warning"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {user.rank}
              </span>
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-foreground">
                {user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Flame className="w-3 h-3" /> {user.streak}
                  </span>
                </div>
              </div>
              <span className="text-sm font-semibold text-accent flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {user.points}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </aside>
  );
};

export default GamificationSidebar;
