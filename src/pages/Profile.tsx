import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Phone, Shield, Trophy, Flame, BookOpen } from "lucide-react";

const Profile = () => {
  const { user, profile, activeTier } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ completedLessons: 0, totalPoints: 0, currentStreak: 0 });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [{ count: lessonsCount }, { data: streakData }] = await Promise.all([
        supabase.from("user_progress").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("completed", true),
        supabase.from("user_streaks").select("total_points, current_streak").eq("user_id", user.id).single(),
      ]);
      setStats({
        completedLessons: lessonsCount || 0,
        totalPoints: streakData?.total_points || 0,
        currentStreak: streakData?.current_streak || 0,
      });
    };
    fetchStats();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      toast.error("Ism bo'sh bo'lishi mumkin emas");
      return;
    }
    if (trimmedPhone && !/^\+?\d{9,15}$/.test(trimmedPhone)) {
      toast.error("Telefon raqam noto'g'ri formatda");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: trimmedName, phone: trimmedPhone || null })
      .eq("user_id", user.id);

    setSaving(false);
    if (error) {
      toast.error("Xatolik yuz berdi");
    } else {
      toast.success("Profil yangilandi!");
    }
  };

  const tierLabels: Record<string, string> = {
    free: "🆓 Bepul",
    intermediate: "📘 O'rta",
    advanced: "🚀 Yuqori",
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">Mening profilim</h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
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

        {/* Profile Form */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <User className="w-5 h-5" /> Shaxsiy ma'lumotlar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-muted-foreground">Email</Label>
              <Input id="email" value={user?.email || ""} disabled className="bg-secondary/50" />
            </div>
            <div>
              <Label htmlFor="name">To'liq ism</Label>
              <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ismingiz" />
            </div>
            <div>
              <Label htmlFor="phone" className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> Telefon raqam
              </Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998901234567" />
            </div>
            <div>
              <Label className="flex items-center gap-1 text-muted-foreground">
                <Shield className="w-3.5 h-3.5" /> Kurs darajasi
              </Label>
              <div className="mt-1 px-3 py-2 rounded-md bg-secondary/50 text-sm text-foreground">
                {tierLabels[activeTier] || activeTier}
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
