import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, Shield, ShieldOff } from "lucide-react";
import { Input } from "@/components/ui/input";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  created_at: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [adminIds, setAdminIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, user_id, full_name, phone, created_at")
      .order("created_at", { ascending: false });

    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, role");

    setUsers(profiles || []);
    setAdminIds(new Set(roles?.filter((r) => r.role === "admin").map((r) => r.user_id) || []));
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleAdmin = async (userId: string) => {
    if (adminIds.has(userId)) {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "admin");
      if (!error) {
        toast.success("Admin huquqi olib tashlandi");
        fetchUsers();
      }
    } else {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: "admin" });
      if (!error) {
        toast.success("Admin huquqi berildi");
        fetchUsers();
      }
    }
  };

  const filtered = users.filter((u) =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Foydalanuvchilar</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card className="glass-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Ism</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Telefon</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Rol</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Sana</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Yuklanmoqda...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Foydalanuvchilar topilmadi</td></tr>
                ) : (
                  filtered.map((user) => (
                    <tr key={user.id} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                            {user.full_name?.charAt(0) || "?"}
                          </div>
                          <span className="text-sm font-medium text-foreground">{user.full_name || "Nomsiz"}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{user.phone || "—"}</td>
                      <td className="p-4">
                        {adminIds.has(user.user_id) ? (
                          <Badge variant="default" className="bg-primary/20 text-primary">Admin</Badge>
                        ) : (
                          <Badge variant="secondary">Foydalanuvchi</Badge>
                        )}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString("uz-UZ")}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAdmin(user.user_id)}
                          className="gap-1"
                        >
                          {adminIds.has(user.user_id) ? (
                            <><ShieldOff className="w-4 h-4" /> Adminni olib tashlash</>
                          ) : (
                            <><Shield className="w-4 h-4" /> Admin qilish</>
                          )}
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

export default AdminUsers;
