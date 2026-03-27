import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Payment {
  id: string;
  user_id: string;
  tier: string;
  amount: number;
  payment_method: string;
  status: string;
  transaction_id: string | null;
  created_at: string;
  profiles?: { full_name: string } | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-warning/20 text-warning",
  completed: "bg-primary/20 text-primary",
  failed: "bg-destructive/20 text-destructive",
  refunded: "bg-muted text-muted-foreground",
};

const tierLabels: Record<string, string> = { basic: "Boshlang'ich", intermediate: "O'rta", advanced: "Yuqori" };
const methodLabels: Record<string, string> = { payme: "Payme", click: "Click", uzcard: "Uzcard", humo: "Humo" };

const AdminPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchPayments = async () => {
    setLoading(true);
    // We can't join profiles directly due to RLS, so fetch separately
    const { data } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      // Fetch profile names for each payment
      const userIds = [...new Set(data.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      setPayments(data.map(p => ({
        ...p,
        profiles: profileMap.get(p.user_id) || null,
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchPayments(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("payments")
      .update({ status })
      .eq("id", id);
    if (!error) {
      toast.success("To'lov holati yangilandi");
      fetchPayments();
    }
  };

  const filtered = filterStatus === "all" ? payments : payments.filter((p) => p.status === filterStatus);
  const totalRevenue = payments.filter(p => p.status === "completed").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">To'lovlar</h1>
          <p className="text-sm text-muted-foreground">Jami daromad: <span className="text-primary font-semibold">{totalRevenue.toLocaleString()} UZS</span></p>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Hammasi</SelectItem>
            <SelectItem value="pending">Kutilmoqda</SelectItem>
            <SelectItem value="completed">Yakunlangan</SelectItem>
            <SelectItem value="failed">Muvaffaqiyatsiz</SelectItem>
            <SelectItem value="refunded">Qaytarilgan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="glass-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Foydalanuvchi</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Bosqich</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Summa</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Usul</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Holat</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Sana</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Yuklanmoqda...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">To'lovlar topilmadi</td></tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="p-4 text-sm font-medium text-foreground">{p.profiles?.full_name || "Noma'lum"}</td>
                      <td className="p-4 text-sm text-muted-foreground">{tierLabels[p.tier] || p.tier}</td>
                      <td className="p-4 text-sm font-medium text-foreground">{p.amount.toLocaleString()} UZS</td>
                      <td className="p-4 text-sm text-muted-foreground">{methodLabels[p.payment_method] || p.payment_method}</td>
                      <td className="p-4">
                        <Badge className={statusColors[p.status] || ""}>{p.status}</Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString("uz-UZ")}</td>
                      <td className="p-4 text-right">
                        <Select value={p.status} onValueChange={(v) => updateStatus(p.id, v)}>
                          <SelectTrigger className="w-36 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Kutilmoqda</SelectItem>
                            <SelectItem value="completed">Yakunlangan</SelectItem>
                            <SelectItem value="failed">Muvaffaqiyatsiz</SelectItem>
                            <SelectItem value="refunded">Qaytarilgan</SelectItem>
                          </SelectContent>
                        </Select>
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

export default AdminPayments;
