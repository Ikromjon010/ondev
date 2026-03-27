import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, BookOpen, CreditCard, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, lessons: 0, payments: 0, revenue: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [{ count: usersCount }, { count: lessonsCount }, { data: paymentsData }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("lessons").select("*", { count: "exact", head: true }),
        supabase.from("payments").select("amount, status"),
      ]);

      const completedPayments = paymentsData?.filter((p) => p.status === "completed") || [];
      const revenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);

      setStats({
        users: usersCount || 0,
        lessons: lessonsCount || 0,
        payments: completedPayments.length,
        revenue,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Foydalanuvchilar", value: stats.users, icon: Users, color: "text-accent" },
    { label: "Darslar", value: stats.lessons, icon: BookOpen, color: "text-primary" },
    { label: "To'lovlar", value: stats.payments, icon: CreditCard, color: "text-warning" },
    { label: "Daromad", value: `${stats.revenue.toLocaleString()} UZS`, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Boshqaruv paneli</h1>
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
    </div>
  );
};

export default AdminDashboard;
