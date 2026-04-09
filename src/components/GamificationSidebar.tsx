import { useEffect, useState } from "react";
import { Trophy, Flame, Star, TrendingUp, Award } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  points: number;
  streak: number;
  userId: string;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  requirement_type: string;
  requirement_value: number;
  earned: boolean;
  progress: number; // 0-100
}

const GamificationSidebar = () => {
  const { user, profile } = useAuth();
  const [myPoints, setMyPoints] = useState(0);
  const [myStreak, setMyStreak] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<"leaderboard" | "badges">("leaderboard");

  useEffect(() => {
    const fetchData = async () => {
      // Fetch leaderboard, badges, and user stats in parallel
      const [streaksRes, allBadgesRes] = await Promise.all([
        supabase
          .from("user_streaks")
          .select("user_id, total_points, current_streak")
          .order("total_points", { ascending: false })
          .limit(10),
        supabase.from("badges").select("*").order("requirement_value"),
      ]);

      const streaks = streaksRes.data;

      // Build leaderboard
      if (streaks && streaks.length > 0) {
        const userIds = streaks.map((s) => s.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", userIds);

        const profileMap = new Map(profiles?.map((p) => [p.user_id, p.full_name]) || []);

        const board: LeaderboardEntry[] = streaks.map((s, i) => {
          const name = profileMap.get(s.user_id) || "Foydalanuvchi";
          const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
          return { rank: i + 1, name, avatar: initials, points: s.total_points, streak: s.current_streak, userId: s.user_id };
        });
        setLeaderboard(board);

        if (user) {
          const myEntry = streaks.find((s) => s.user_id === user.id);
          if (myEntry) {
            setMyPoints(myEntry.total_points);
            setMyStreak(myEntry.current_streak);
          }
        }
      }

      // Build badges with progress
      if (allBadgesRes.data && user) {
        const [{ data: earnedBadges }, { count: lessonsCompleted }, { count: tasksCompleted }] = await Promise.all([
          supabase.from("user_badges").select("badge_id").eq("user_id", user.id),
          supabase.from("user_progress").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("completed", true),
          supabase.from("user_progress").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("completed", true).not("submitted_code", "is", null),
        ]);

        const myEntry = streaks?.find((s) => s.user_id === user.id);
        const stats: Record<string, number> = {
          lessons_completed: lessonsCompleted || 0,
          streak_days: myEntry?.current_streak || 0,
          total_points: myEntry?.total_points || 0,
          tasks_completed: tasksCompleted || 0,
        };

        const earnedIds = new Set(earnedBadges?.map((b) => b.badge_id) || []);

        const badgeList: Badge[] = allBadgesRes.data.map((b) => {
          const current = stats[b.requirement_type] || 0;
          const progress = Math.min(100, Math.round((current / b.requirement_value) * 100));
          return {
            id: b.id,
            name: b.name,
            icon: b.icon,
            description: b.description,
            requirement_type: b.requirement_type,
            requirement_value: b.requirement_value,
            earned: earnedIds.has(b.id),
            progress,
          };
        });
        setBadges(badgeList);
      }

      setLoading(false);
    };
    fetchData();
  }, [user]);

  const displayName = profile?.full_name || "Foydalanuvchi";
  const avatar = displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  if (loading) {
    return (
      <aside className="w-80 shrink-0 space-y-5">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </aside>
    );
  }

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <aside className="w-80 shrink-0 space-y-5">
      {/* User Profile Card */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
            {avatar}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{displayName}</h3>
            <p className="text-sm text-muted-foreground">Python o'rganuvchi</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-secondary rounded-lg p-2.5 text-center">
            <Star className="w-4 h-4 text-warning mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{myPoints}</p>
            <p className="text-xs text-muted-foreground">Ballar</p>
          </div>
          <div className="bg-secondary rounded-lg p-2.5 text-center">
            <Flame className="w-4 h-4 text-destructive mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{myStreak}</p>
            <p className="text-xs text-muted-foreground">Streak</p>
          </div>
          <div className="bg-secondary rounded-lg p-2.5 text-center">
            <Award className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{earnedCount}</p>
            <p className="text-xs text-muted-foreground">Yutuqlar</p>
          </div>
        </div>
      </motion.div>

      {/* Section toggle */}
      <div className="flex gap-1 bg-secondary rounded-lg p-1">
        <button
          onClick={() => setActiveSection("leaderboard")}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
            activeSection === "leaderboard" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          🏆 Reyting
        </button>
        <button
          onClick={() => setActiveSection("badges")}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
            activeSection === "badges" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          🎖️ Yutuqlar
        </button>
      </div>

      {/* Leaderboard */}
      {activeSection === "leaderboard" && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-warning" />
            <h3 className="font-semibold text-foreground">Peshqadamlar reytingi</h3>
          </div>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Hozircha ma'lumot yo'q</p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                    entry.userId === user?.id ? "bg-primary/10 border border-primary/30" : "hover:bg-secondary/50"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      entry.rank === 1
                        ? "bg-warning text-warning-foreground"
                        : entry.rank === 2
                        ? "bg-muted-foreground/30 text-foreground"
                        : entry.rank === 3
                        ? "bg-warning/40 text-warning"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {entry.rank}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-foreground">
                    {entry.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{entry.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <Flame className="w-3 h-3" /> {entry.streak}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-accent flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {entry.points}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Badges */}
      {activeSection === "badges" && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Yutuqlar</h3>
            <span className="ml-auto text-xs text-muted-foreground">{earnedCount}/{badges.length}</span>
          </div>
          <div className="space-y-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-3 rounded-lg border transition-all ${
                  badge.earned
                    ? "bg-primary/5 border-primary/30"
                    : "bg-secondary/30 border-border opacity-70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-2xl ${badge.earned ? "" : "grayscale"}`}>{badge.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                    {!badge.earned && (
                      <div className="mt-1.5">
                        <Progress value={badge.progress} className="h-1.5" />
                        <p className="text-[10px] text-muted-foreground mt-0.5">{badge.progress}%</p>
                      </div>
                    )}
                  </div>
                  {badge.earned && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </aside>
  );
};

import { CheckCircle2 } from "lucide-react";

export default GamificationSidebar;
