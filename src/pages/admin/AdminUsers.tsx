import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, Shield, ShieldOff, Ban, Unlock, Trash2, Crown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  is_blocked: boolean;
  active_tier: string;
  created_at: string;
}

interface CurrentLessonInfo {
  id: number;
  title: string;
}

const TIER_LABELS: Record<string, string> = {
  free: "Bepul",
  intermediate: "O'rta",
  advanced: "Yuqori",
};

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [adminIds, setAdminIds] = useState<Set<string>>(new Set());
  const [currentLessons, setCurrentLessons] = useState<Record<string, CurrentLessonInfo>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, user_id, full_name, phone, is_blocked, active_tier, created_at")
      .order("created_at", { ascending: false });

    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, role");

    const profileList = (profiles as UserProfile[]) || [];
    setUsers(profileList);
    setAdminIds(new Set(roles?.filter((r) => r.role === "admin").map((r) => r.user_id) || []));

    // Har bir user uchun joriy darsni hisoblash
    if (profileList.length > 0) {
      const userIds = profileList.map((u) => u.user_id);
      const { data: progress } = await supabase
        .from("user_progress")
        .select("user_id, lesson_id")
        .in("user_id", userIds)
        .eq("completed", true);

      // Har bir userning oxirgi tugatgan lesson_id si
      const lastByUser: Record<string, number> = {};
      (progress || []).forEach((p) => {
        if (!lastByUser[p.user_id] || p.lesson_id > lastByUser[p.user_id]) {
          lastByUser[p.user_id] = p.lesson_id;
        }
      });

      // Barcha darslarni olib, mapping qilish
      const { data: lessons } = await supabase
        .from("lessons")
        .select("id, title")
        .order("id", { ascending: true });
      const lessonList = lessons || [];

      const result: Record<string, CurrentLessonInfo> = {};
      profileList.forEach((u) => {
        const lastId = lastByUser[u.user_id];
        if (lastId === undefined) {
          // hech narsa tugatmagan — birinchi dars
          if (lessonList[0]) result[u.user_id] = lessonList[0];
        } else {
          const next = lessonList.find((l) => l.id > lastId);
          result[u.user_id] = next || lessonList.find((l) => l.id === lastId) || lessonList[0];
        }
      });
      setCurrentLessons(result);
    }

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
      if (!error) { toast.success("Admin huquqi olib tashlandi"); fetchUsers(); }
    } else {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: "admin" });
      if (!error) { toast.success("Admin huquqi berildi"); fetchUsers(); }
    }
  };

  const toggleBlock = async (user: UserProfile) => {
    const newBlocked = !user.is_blocked;
    const { error } = await supabase
      .from("profiles")
      .update({ is_blocked: newBlocked })
      .eq("user_id", user.user_id);
    if (!error) {
      toast.success(newBlocked ? "Foydalanuvchi bloklandi" : "Blok olib tashlandi");
      fetchUsers();
    } else {
      toast.error("Xatolik yuz berdi");
    }
  };

  const changeTier = async (userId: string, tier: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ active_tier: tier })
      .eq("user_id", userId);
    if (!error) {
      toast.success(`Kurs darajasi "${TIER_LABELS[tier]}" ga o'zgartirildi`);
      fetchUsers();
    } else {
      toast.error("Xatolik yuz berdi");
    }
  };

  const deleteUser = async () => {
    if (!deleteTarget) return;
    const { data, error } = await supabase.functions.invoke("delete-user", {
      body: { user_id: deleteTarget.user_id },
    });
    if (error || data?.error) {
      toast.error(data?.error || "Foydalanuvchini o'chirishda xatolik");
    } else {
      toast.success("Foydalanuvchi o'chirildi");
      fetchUsers();
    }
    setDeleteTarget(null);
  };

  const filtered = users.filter((u) =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Foydalanuvchilar ({users.length})</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Ism yoki telefon..."
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
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Kurs darajasi</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Joriy dars</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Holat</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Sana</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Yuklanmoqda...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Foydalanuvchilar topilmadi</td></tr>
                ) : (
                  filtered.map((user) => (
                    <tr key={user.id} className={`border-b border-border/50 hover:bg-secondary/30 ${user.is_blocked ? 'opacity-60' : ''}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${user.is_blocked ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'}`}>
                            {user.full_name?.charAt(0) || "?"}
                          </div>
                          <span className="text-sm font-medium text-foreground">{user.full_name || "Nomsiz"}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground font-mono">{user.phone || "—"}</td>
                      <td className="p-4">
                        {adminIds.has(user.user_id) ? (
                          <Badge variant="default" className="bg-primary/20 text-primary">Admin</Badge>
                        ) : (
                          <Badge variant="secondary">Foydalanuvchi</Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <Select
                          value={user.active_tier}
                          onValueChange={(val) => changeTier(user.user_id, val)}
                        >
                          <SelectTrigger className="w-28 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">🆓 Bepul</SelectItem>
                            <SelectItem value="intermediate">📘 O'rta</SelectItem>
                            <SelectItem value="advanced">🚀 Yuqori</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-4">
                        {currentLessons[user.user_id] ? (
                          <Link
                            to={`/lesson/${currentLessons[user.user_id].id}`}
                            className="text-xs text-accent hover:underline"
                            title={currentLessons[user.user_id].title}
                          >
                            #{currentLessons[user.user_id].id} —{" "}
                            {currentLessons[user.user_id].title.length > 28
                              ? currentLessons[user.user_id].title.slice(0, 28) + "…"
                              : currentLessons[user.user_id].title}
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        {user.is_blocked ? (
                          <Badge variant="destructive" className="text-xs">Bloklangan</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-green-500 border-green-500/30">Faol</Badge>
                        )}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString("uz-UZ")}
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">⋯</Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toggleAdmin(user.user_id)}>
                              {adminIds.has(user.user_id) ? (
                                <><ShieldOff className="w-4 h-4 mr-2" /> Admin olib tashlash</>
                              ) : (
                                <><Shield className="w-4 h-4 mr-2" /> Admin qilish</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleBlock(user)}>
                              {user.is_blocked ? (
                                <><Unlock className="w-4 h-4 mr-2" /> Blokni olib tashlash</>
                              ) : (
                                <><Ban className="w-4 h-4 mr-2" /> Bloklash</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteTarget(user)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> O'chirish
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Foydalanuvchini o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.full_name}</strong> ni butunlay o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={deleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
