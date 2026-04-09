import { supabase } from "@/integrations/supabase/client";

interface GamificationResult {
  pointsEarned: number;
  streakUpdated: boolean;
  newStreak: number;
  newBadges: { name: string; icon: string; description: string }[];
  totalPoints: number;
}

export async function awardPoints(
  userId: string,
  lessonId: number,
  submittedCode: string | null,
  points: number = 50
): Promise<GamificationResult> {
  const result: GamificationResult = {
    pointsEarned: points,
    streakUpdated: false,
    newStreak: 0,
    newBadges: [],
    totalPoints: 0,
  };

  // 1. Save progress (upsert)
  await supabase.from("user_progress").upsert(
    {
      user_id: userId,
      lesson_id: lessonId,
      completed: true,
      completed_at: new Date().toISOString(),
      points_earned: points,
      submitted_code: submittedCode,
    },
    { onConflict: "user_id,lesson_id" }
  );

  // 2. Update streak
  const today = new Date().toISOString().split("T")[0];
  const { data: streak } = await supabase
    .from("user_streaks")
    .select("*")
    .eq("user_id", userId)
    .single();

  let currentStreak = 1;
  let longestStreak = 1;
  let totalPoints = points;

  if (streak) {
    const lastDate = streak.last_activity_date;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    if (lastDate === today) {
      // Already active today, just add points
      currentStreak = streak.current_streak;
      longestStreak = streak.longest_streak;
      totalPoints = streak.total_points + points;
    } else if (lastDate === yesterday) {
      // Consecutive day
      currentStreak = streak.current_streak + 1;
      longestStreak = Math.max(streak.longest_streak, currentStreak);
      totalPoints = streak.total_points + points;
      result.streakUpdated = true;
    } else {
      // Streak broken
      currentStreak = 1;
      longestStreak = streak.longest_streak;
      totalPoints = streak.total_points + points;
      result.streakUpdated = true;
    }

    await supabase
      .from("user_streaks")
      .update({
        current_streak: currentStreak,
        longest_streak: longestStreak,
        total_points: totalPoints,
        last_activity_date: today,
      })
      .eq("user_id", userId);
  } else {
    // First time
    totalPoints = points;
    result.streakUpdated = true;
    await supabase.from("user_streaks").insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      total_points: points,
      last_activity_date: today,
    });
  }

  result.newStreak = currentStreak;
  result.totalPoints = totalPoints;

  // 3. Check for new badges
  const [{ count: lessonsCompleted }, { count: tasksCompleted }] = await Promise.all([
    supabase
      .from("user_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("completed", true),
    supabase
      .from("user_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("completed", true)
      .not("submitted_code", "is", null),
  ]);

  // Get all badges and user's existing badges
  const [{ data: allBadges }, { data: earnedBadges }] = await Promise.all([
    supabase.from("badges").select("*"),
    supabase.from("user_badges").select("badge_id").eq("user_id", userId),
  ]);

  const earnedIds = new Set(earnedBadges?.map((b) => b.badge_id) || []);
  const stats: Record<string, number> = {
    lessons_completed: lessonsCompleted || 0,
    streak_days: currentStreak,
    total_points: totalPoints,
    tasks_completed: tasksCompleted || 0,
  };

  for (const badge of allBadges || []) {
    if (earnedIds.has(badge.id)) continue;
    const val = stats[badge.requirement_type] || 0;
    if (val >= badge.requirement_value) {
      await supabase.from("user_badges").insert({ user_id: userId, badge_id: badge.id });
      result.newBadges.push({ name: badge.name, icon: badge.icon, description: badge.description });

      // Award bonus points for badge
      if (badge.points_reward > 0) {
        totalPoints += badge.points_reward;
        result.totalPoints = totalPoints;
        await supabase
          .from("user_streaks")
          .update({ total_points: totalPoints })
          .eq("user_id", userId);
      }
    }
  }

  return result;
}
