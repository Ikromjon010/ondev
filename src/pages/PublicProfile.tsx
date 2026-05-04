import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFollow } from "@/hooks/useFollow";
import AppHeader from "@/components/AppHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Trophy,
  Flame,
  BookOpen,
  Users as UsersIcon,
  UserPlus,
  UserMinus,
  Code2,
  Presentation,
} from "lucide-react";
import { useInstructorCourses } from "@/hooks/useInstructorCourses";

interface ProfileData {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  active_tier: string;
  created_at: string;
}

const tierLabels: Record<string, string> = {
  free: "🆓 Bepul",
  intermediate: "📘 O'rta",
  advanced: "🚀 Yuqori",
};

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFollowing, followersCount, followingCount, loading: followLoading, toggleFollow } =
    useFollow(id);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState({ completedLessons: 0, totalPoints: 0, currentStreak: 0 });
  const [currentLesson, setCurrentLesson] = useState<{ id: number; title: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const { courses: taughtCourses, isInstructor } = useInstructorCourses(id);

  useEffect(() => {
    if (!id) return;
    if (user?.id === id) {
      navigate("/profile", { replace: true });
      return;
    }
    const fetchAll = async () => {
      setLoading(true);
      const [{ data: prof }, { data: streak }, { count: lessonsCount }, { data: lastProgress }] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("user_id, full_name, avatar_url, active_tier, created_at")
            .eq("user_id", id)
            .maybeSingle(),
          supabase
            .from("user_streaks")
            .select("total_points, current_streak")
            .eq("user_id", id)
            .maybeSingle(),
          supabase
            .from("user_progress")
            .select("*", { count: "exact", head: true })
            .eq("user_id", id)
            .eq("completed", true),
          supabase
            .from("user_progress")
            .select("lesson_id")
            .eq("user_id", id)
            .eq("completed", true)
            .order("lesson_id", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

      setProfile(prof as ProfileData | null);
      setStats({
        completedLessons: lessonsCount || 0,
        totalPoints: streak?.total_points || 0,
        currentStreak: streak?.current_streak || 0,
      });

      // Joriy dars: oxirgi tugatilgandan keyingi dars
      if (lastProgress) {
        const { data: next } = await supabase
          .from("lessons")
          .select("id, title")
          .gt("id", lastProgress.lesson_id)
          .order("id", { ascending: true })
          .limit(1)
          .maybeSingle();
        if (next) setCurrentLesson(next);
        else {
          const { data: last } = await supabase
            .from("lessons")
            .select("id, title")
            .eq("id", lastProgress.lesson_id)
            .maybeSingle();
          if (last) setCurrentLesson(last);
        }
      } else {
        const { data: first } = await supabase
          .from("lessons")
          .select("id, title")
          .order("id", { ascending: true })
          .limit(1)
          .maybeSingle();
        if (first) setCurrentLesson(first);
      }

      setLoading(false);
    };
    fetchAll();
  }, [id, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container px-4 py-8 max-w-2xl">
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-24 w-full" />
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container px-4 py-8 max-w-2xl text-center">
          <p className="text-muted-foreground">Foydalanuvchi topilmadi</p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/users">Orqaga</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container px-4 py-6 max-w-2xl">
        <Link
          to="/users"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> O'quvchilar
        </Link>

        {/* Header card */}
        <Card className="glass-card mb-4">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl">
                {profile.full_name?.charAt(0) || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-foreground truncate">
                  {profile.full_name || "Noma'lum"}
                </h1>
                <p className="text-sm text-muted-foreground">{tierLabels[profile.active_tier]}</p>
              </div>
              {user && user.id !== profile.user_id && (
                <Button
                  size="sm"
                  variant={isFollowing ? "outline" : "default"}
                  onClick={toggleFollow}
                  disabled={followLoading}
                  className="gap-1"
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4" /> Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" /> Follow
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Darslar", value: stats.completedLessons, icon: BookOpen, color: "text-primary" },
            { label: "Ball", value: stats.totalPoints, icon: Trophy, color: "text-warning" },
            { label: "Streak", value: `${stats.currentStreak} kun`, icon: Flame, color: "text-destructive" },
          ].map((s) => (
            <Card key={s.label} className="glass-card text-center">
              <CardContent className="pt-4 pb-3">
                <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Follow stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="glass-card text-center">
            <CardContent className="pt-4 pb-3">
              <UsersIcon className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold text-foreground">{followersCount}</p>
              <p className="text-xs text-muted-foreground">Follower</p>
            </CardContent>
          </Card>
          <Card className="glass-card text-center">
            <CardContent className="pt-4 pb-3">
              <UsersIcon className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-bold text-foreground">{followingCount}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </CardContent>
          </Card>
        </div>

        {/* Current lesson */}
        {currentLesson && (
          <Card className="glass-card">
            <CardContent className="pt-5 pb-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-accent/15 flex items-center justify-center">
                <Code2 className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Hozir o'rganayotgan dars</p>
                <p className="text-sm font-medium text-foreground truncate">
                  #{currentLesson.id} — {currentLesson.title}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default PublicProfile;
