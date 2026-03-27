import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trophy, Flame, Save } from "lucide-react";

interface StreakRow {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  total_points: number;
  last_activity_date: string | null;
  profile?: { full_name: string } | null;
}

const AdminLeaderboard = () => {
  const [streaks, setStreaks] = useState<StreakRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editedPoints, setEditedPoints] = useState<Record<string, number>>({});

  const fetchStreaks = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("user_streaks")
      .select("*")
      .order("total_points", { ascending: false });

    if (data) {
      const userIds = data.map(s => s.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      setStreaks(data.map(s => ({ ...s, profile: profileMap.get(s.user_id) || null })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchStreaks(); }, []);

  const savePoints = async (id: string) => {
    const newPoints = editedPoints[id];
    if (newPoints === undefined) return;
    const { error } = await supabase
      .from("user_streaks")
      .update({ total_points: newPoints })
      .eq("id", id);
    if (!error) {
      toast.success("Ballar yangilandi");
      fetchStreaks();
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Reyting va ballar</h1>

      <Card className="glass-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">#</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Foydalanuvchi</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Ballar</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Streak</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Eng uzun streak</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Oxirgi faollik</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Yuklanmoqda...</td></tr>
                ) : streaks.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">
                    <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    Hozircha reyting ma'lumotlari yo'q
                  </td></tr>
                ) : (
                  streaks.map((s, i) => (
                    <tr key={s.id} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="p-4">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          i === 0 ? "bg-warning text-warning-foreground" :
                          i === 1 ? "bg-muted-foreground/30 text-foreground" :
                          i === 2 ? "bg-warning/40 text-warning" :
                          "bg-secondary text-muted-foreground"
                        }`}>{i + 1}</span>
                      </td>
                      <td className="p-4 text-sm font-medium text-foreground">{s.profile?.full_name || "Noma'lum"}</td>
                      <td className="p-4">
                        <Input
                          type="number"
                          className="w-24 h-8 text-sm"
                          defaultValue={s.total_points}
                          onChange={(e) => setEditedPoints({ ...editedPoints, [s.id]: +e.target.value })}
                        />
                      </td>
                      <td className="p-4 text-sm text-foreground flex items-center gap-1">
                        <Flame className="w-4 h-4 text-destructive" /> {s.current_streak}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{s.longest_streak}</td>
                      <td className="p-4 text-sm text-muted-foreground">{s.last_activity_date || "—"}</td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => savePoints(s.id)} className="gap-1">
                          <Save className="w-4 h-4" /> Saqlash
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLeaderboard;
