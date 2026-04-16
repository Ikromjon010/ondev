import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, BookOpen, CreditCard, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, lessons: 0, payments: 0, revenue: 0 });
  const [tierData, setTierData] = useState<{ name: string; value: number }[]>([]);
  const [recentSignups, setRecentSignups] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const [{ count: usersCount }, { count: lessonsCount }, { data: paymentsData }, { data: profilesData }] =
        await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("lessons").select("*", { count: "exact", head: true }),
          supabase.from("payments").select("amount, status"),
          supabase.from("profiles").select("active_tier, created_at"),
        ]);

      const completedPayments = paymentsData?.filter((p) => p.status === "completed") || [];
      const revenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);

      setStats({ users: usersCount || 0, lessons: lessonsCount || 0, payments: completedPayments.length, revenue });

      // Tier distribution
      const tierCounts: Record<string, number> = {};
      profilesData?.forEach((p) => {
        const t = p.active_tier || "free";
        tierCounts[t] = (tierCounts[t] || 0) + 1;
      });
      const tierLabels: Record<string, string> = { free: "Bepul", intermediate: "O'rta", advanced: "Yuqori" };
      setTierData(Object.entries(tierCounts).map(([k, v]) => ({ name: tierLabels[k] || k, value: v })));

      // Recent signups (last 7 days)
      const days: Record<string, number> = {};
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        days[d.toISOString().slice(0, 10)] = 0;
      }
      profilesData?.forEach((p) => {
        const d = p.created_at.slice(0, 10);
        if (d in days) days[d]++;
      });
      setRecentSignups(Object.entries(days).map(([date, count]) => ({ date: date.slice(5), count })));
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Foydalanuvchilar", value: stats.users, icon: Users, color: "text-accent" },
    { label: "Darslar", value: stats.lessons, icon: BookOpen, color: "text-primary" },
    { label: "To'lovlar", value: stats.payments, icon: CreditCard, color: "text-warning" },
    { label: "Daromad", value: `${stats.revenue.toLocaleString()} UZS`, icon: TrendingUp, color: "text-primary" },
  ];

  const PIE_COLORS = ["hsl(160, 84%, 39%)", "hsl(210, 100%, 56%)", "hsl(38, 92%, 50%)"];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Boshqaruv paneli</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.label} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Oxirgi 7 kun — Yangi foydalanuvchilar</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={recentSignups}>
                <XAxis dataKey="date" stroke="hsl(215, 14%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(215, 14%, 55%)" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(220, 14%, 13%)", border: "1px solid hsl(220, 12%, 20%)", borderRadius: 8, color: "hsl(210, 20%, 92%)" }}
                />
                <Bar dataKey="count" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Foydalanuvchilar — Kurs darajasi</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={tierData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                  {tierData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "hsl(220, 14%, 13%)", border: "1px solid hsl(220, 12%, 20%)", borderRadius: 8, color: "hsl(210, 20%, 92%)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
