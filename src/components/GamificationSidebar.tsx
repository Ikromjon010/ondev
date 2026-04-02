import { useEffect, useState } from "react";
import { Trophy, Flame, Star, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  points: number;
  streak: number;
  userId: string;
}

const GamificationSidebar = () => {
  const { user, profile } = useAuth();
  const [myPoints, setMyPoints] = useState(0);
  const [myStreak, setMyStreak] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch all streaks with profiles for leaderboard
      const { data: streaks } = await supabase
        .from("user_streaks")
        .select("user_id, total_points, current_streak")
        .order("total_points", { ascending: false })
        .limit(10);

      if (streaks && streaks.length > 0) {
        const userIds = streaks.map((s) => s.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", userIds);

        const profileMap = new Map(profiles?.map((p) => [p.user_id, p.full_name]) || []);

        const board: LeaderboardEntry[] = streaks.map((s, i) => {
          const name = profileMap.get(s.user_id) || "Foydalanuvchi";
          const initials = name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          return {
            rank: i + 1,
            name,
            avatar: initials,
            points: s.total_points,
            streak: s.current_streak,
            userId: s.user_id,
          };
        });
        setLeaderboard(board);

        // Set current user stats
        if (user) {
          const myEntry = streaks.find((s) => s.user_id === user.id);
          if (myEntry) {
            setMyPoints(myEntry.total_points);
            setMyStreak(myEntry.current_streak);
          }
        }
      }

      setLoading(false);
    };
    fetchData();
  }, [user]);

  const displayName = profile?.full_name || "Foydalanuvchi";
  const avatar = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (loading) {
    return (
      <aside className="w-80 shrink-0 space-y-5">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </aside>
    );
  }

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
            {avatar}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{displayName}</h3>
            <p className="text-sm text-muted-foreground">Python o'rganuvchi</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary rounded-lg p-3 text-center">
            <Star className="w-4 h-4 text-warning mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{myPoints}</p>
            <p className="text-xs text-muted-foreground">Ballar</p>
          </div>
          <div className="bg-secondary rounded-lg p-3 text-center">
            <Flame className="w-4 h-4 text-destructive mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{myStreak}</p>
            <p className="text-xs text-muted-foreground">Kunlik faollik</p>
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
                  entry.userId === user?.id
                    ? "bg-primary/10 border border-primary/30"
                    : "hover:bg-secondary/50"
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
    </aside>
  );
};

export default GamificationSidebar;
