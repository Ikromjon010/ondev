import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AppHeader from "@/components/AppHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users as UsersIcon, UserPlus, UserMinus, Search, Trophy, Flame } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface UserItem {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  active_tier: string;
}

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, active_tier")
        .neq("user_id", user?.id || "")
        .order("full_name");

      setUsers(profiles || []);

      if (user) {
        const { data: follows } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", user.id);
        setFollowingIds(new Set(follows?.map((f) => f.following_id) || []));
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleToggle = async (targetId: string) => {
    if (!user) return;
    setToggling(targetId);
    const isFollowing = followingIds.has(targetId);

    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", targetId);
      setFollowingIds((prev) => {
        const next = new Set(prev);
        next.delete(targetId);
        return next;
      });
      toast.success("Unfollow qilindi");
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: targetId });
      setFollowingIds((prev) => new Set(prev).add(targetId));
      toast.success("Follow qilindi!");
    }
    setToggling(null);
  };

  const filtered = users.filter((u) =>
    u.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const tierBadge: Record<string, string> = {
    free: "🆓",
    intermediate: "📘",
    advanced: "🚀",
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-2 mb-6">
          <UsersIcon className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">O'quvchilar</h1>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Ism bo'yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <p className="text-muted-foreground text-center py-8">Yuklanmoqda...</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Foydalanuvchi topilmadi</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((u) => {
              const isFollowing = followingIds.has(u.user_id);
              return (
                <Card key={u.user_id} className="glass-card">
                  <CardContent className="flex items-center justify-between py-3 px-4">
                    <Link
                      to={`/users/${u.user_id}`}
                      className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        {u.full_name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {u.full_name || "Noma'lum"}{" "}
                          <span className="text-xs">{tierBadge[u.active_tier] || ""}</span>
                        </p>
                      </div>
                    </Link>
                    <Button
                      size="sm"
                      variant={isFollowing ? "outline" : "default"}
                      onClick={() => handleToggle(u.user_id)}
                      disabled={toggling === u.user_id}
                      className="gap-1 text-xs"
                    >
                      {isFollowing ? (
                        <>
                          <UserMinus className="w-3.5 h-3.5" /> Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" /> Follow
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Users;
