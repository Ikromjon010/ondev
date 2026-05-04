import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, Shield, ShieldOff, Ban, Unlock, Trash2, Presentation, UserPlus } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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

interface CourseLite {
  id: string;
  title: string;
  icon: string;
  instructor_id: string | null;
}

const TIER_LABELS: Record<string, string> = {
  free: "Bepul",
  intermediate: "O'rta",
  advanced: "Yuqori",
};

const normalizePhone = (s: string) => s.replace(/[^\d]/g, "");

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [adminIds, setAdminIds] = useState<Set<string>>(new Set());
  const [instructorIds, setInstructorIds] = useState<Set<string>>(new Set());
  const [currentLessons, setCurrentLessons] = useState<Record<string, CurrentLessonInfo>>({});
  const [courses, setCourses] = useState<CourseLite[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);

  // Invite dialog state
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteQuery, setInviteQuery] = useState("");
  const [inviteFound, setInviteFound] = useState<UserProfile | null>(null);
  const [inviteSearching, setInviteSearching] = useState(false);
  const [inviteCourseId, setInviteCourseId] = useState<string>("");

  const fetchUsers = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: roles }, { data: crs }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, user_id, full_name, phone, is_blocked, active_tier, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("courses").select("id, title, icon, instructor_id").order("sort_order"),
    ]);

    const profileList = (profiles as UserProfile[]) || [];
    setUsers(profileList);
    setAdminIds(new Set(roles?.filter((r) => r.role === "admin").map((r) => r.user_id) || []));
    setInstructorIds(new Set(roles?.filter((r) => r.role === "instructor").map((r) => r.user_id) || []));
    setCourses((crs as CourseLite[]) || []);

    // Joriy dars hisoblash
    if (profileList.length > 0) {
      const userIds = profileList.map((u) => u.user_id);
      const { data: progress } = await supabase
        .from("user_progress")
        .select("user_id, lesson_id")
        .in("user_id", userIds)
        .eq("completed", true);

      const lastByUser: Record<string, number> = {};
      (progress || []).forEach((p) => {
        if (!lastByUser[p.user_id] || p.lesson_id > lastByUser[p.user_id]) {
          lastByUser[p.user_id] = p.lesson_id;
        }
      });

      const { data: lessons } = await supabase
        .from("lessons")
        .select("id, title")
        .order("id", { ascending: true });
      const lessonList = lessons || [];

      const result: Record<string, CurrentLessonInfo> = {};
      profileList.forEach((u) => {
        const lastId = lastByUser[u.user_id];
        if (lastId === undefined) {
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

  // Ustoz biriktirilgan kurslarni user_id bo'yicha guruhlash
  const coursesByInstructor: Record<string, CourseLite[]> = {};
  courses.forEach((c) => {
    if (c.instructor_id) {
      (coursesByInstructor[c.instructor_id] ||= []).push(c);
    }
  });

  const toggleAdmin = async (userId: string) => {
    if (adminIds.has(userId)) {
      const { error } = await supabase
        .from("user_roles").delete()
        .eq("user_id", userId).eq("role", "admin");
      if (!error) { toast.success("Admin huquqi olib tashlandi"); fetchUsers(); }
    } else {
      const { error } = await supabase
        .from("user_roles").insert({ user_id: userId, role: "admin" });
      if (!error) { toast.success("Admin huquqi berildi"); fetchUsers(); }
    }
  };

  const toggleInstructor = async (userId: string) => {
    if (instructorIds.has(userId)) {
      const { error } = await supabase
        .from("user_roles").delete()
        .eq("user_id", userId).eq("role", "instructor");
      if (!error) { toast.success("Ustoz huquqi olib tashlandi"); fetchUsers(); }
    } else {
      const { error } = await supabase
        .from("user_roles").insert({ user_id: userId, role: "instructor" });
      if (!error) { toast.success("Ustoz huquqi berildi"); fetchUsers(); }
    }
  };

  const toggleBlock = async (user: UserProfile) => {
    const newBlocked = !user.is_blocked;
    const { error } = await supabase
      .from("profiles").update({ is_blocked: newBlocked }).eq("user_id", user.user_id);
    if (!error) {
      toast.success(newBlocked ? "Foydalanuvchi bloklandi" : "Blok olib tashlandi");
      fetchUsers();
    } else toast.error("Xatolik yuz berdi");
  };

  const changeTier = async (userId: string, tier: string) => {
    const { error } = await supabase
      .from("profiles").update({ active_tier: tier }).eq("user_id", userId);
    if (!error) {
      toast.success(`Kurs darajasi "${TIER_LABELS[tier]}" ga o'zgartirildi`);
      fetchUsers();
    } else toast.error("Xatolik yuz berdi");
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

  // ===== Invite flow =====
  const handleInviteSearch = async () => {
    const q = inviteQuery.trim();
    if (!q) { toast.error("Telefon yoki ism kiriting"); return; }
    setInviteSearching(true);
    setInviteFound(null);

    const digits = normalizePhone(q);
    let query = supabase
      .from("profiles")
      .select("id, user_id, full_name, phone, is_blocked, active_tier, created_at")
      .limit(1);

    if (digits.length >= 7) {
      // Telefon bo'yicha qidirish (qisman moslik)
      query = query.ilike("phone", `%${digits}%`);
    } else {
      query = query.ilike("full_name", `%${q}%`);
    }
    const { data } = await query;
    setInviteSearching(false);
    if (!data || data.length === 0) {
      toast.error("Foydalanuvchi topilmadi. Avval ro'yxatdan o'tsin.");
      return;
    }
    setInviteFound(data[0] as UserProfile);
  };

  const handleInviteAssign = async () => {
    if (!inviteFound) return;
    const targetUserId = inviteFound.user_id;

    // 1) Instructor rolini berish (agar yo'q bo'lsa)
    if (!instructorIds.has(targetUserId)) {
      const { error: roleErr } = await supabase
        .from("user_roles").insert({ user_id: targetUserId, role: "instructor" });
      if (roleErr) {
        toast.error("Rol berishda xatolik: " + roleErr.message);
        return;
      }
    }

    // 2) Tanlangan kursga biriktirish
    if (inviteCourseId) {
      const { error: crsErr } = await supabase
        .from("courses").update({ instructor_id: targetUserId }).eq("id", inviteCourseId);
      if (crsErr) {
        toast.error("Kursga biriktirishda xatolik: " + crsErr.message);
        return;
      }
    }

    toast.success(`${inviteFound.full_name} ustoz qilib tayinlandi`);
    setInviteOpen(false);
    setInviteQuery("");
    setInviteFound(null);
    setInviteCourseId("");
    fetchUsers();
  };

  const filtered = users.filter((u) =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-foreground">Foydalanuvchilar ({users.length})</h1>
        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-1" onClick={() => setInviteOpen(true)}>
            <UserPlus className="w-4 h-4" /> Ustoz taklif qilish
          </Button>
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
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Ustoz kurs(lar)</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Daraja</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Joriy dars</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Holat</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Yuklanmoqda...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Foydalanuvchilar topilmadi</td></tr>
                ) : (
                  filtered.map((user) => {
                    const taughtCourses = coursesByInstructor[user.user_id] || [];
                    return (
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
                          <div className="flex flex-wrap gap-1">
                            {adminIds.has(user.user_id) && (
                              <Badge variant="default" className="bg-primary/20 text-primary">Admin</Badge>
                            )}
                            {instructorIds.has(user.user_id) && (
                              <Badge variant="default" className="bg-amber-500/15 text-amber-400 border border-amber-500/30">Ustoz</Badge>
                            )}
                            {!adminIds.has(user.user_id) && !instructorIds.has(user.user_id) && (
                              <Badge variant="secondary">Foydalanuvchi</Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {instructorIds.has(user.user_id) ? (
                            <div className="flex flex-col gap-1">
                              {taughtCourses.length > 0 ? (
                                taughtCourses.map((c) => (
                                  <span key={c.id} className="text-xs text-foreground">
                                    {c.icon} {c.title}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-muted-foreground italic">— biriktirilmagan</span>
                              )}
                              <Select
                                value=""
                                onValueChange={async (courseId) => {
                                  const { error } = await supabase
                                    .from("courses")
                                    .update({ instructor_id: user.user_id })
                                    .eq("id", courseId);
                                  if (error) toast.error(error.message);
                                  else { toast.success("Kursga biriktirildi"); fetchUsers(); }
                                }}
                              >
                                <SelectTrigger className="w-40 h-7 text-xs">
                                  <SelectValue placeholder="+ Kurs biriktirish" />
                                </SelectTrigger>
                                <SelectContent>
                                  {courses
                                    .filter((c) => c.instructor_id !== user.user_id)
                                    .map((c) => (
                                      <SelectItem key={c.id} value={c.id} className="text-xs">
                                        {c.icon} {c.title}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
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
                              {currentLessons[user.user_id].title.length > 24
                                ? currentLessons[user.user_id].title.slice(0, 24) + "…"
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
                              <DropdownMenuItem onClick={() => toggleInstructor(user.user_id)}>
                                <Presentation className="w-4 h-4 mr-2" />
                                {instructorIds.has(user.user_id) ? "Ustozlikni olib tashlash" : "Ustoz qilish"}
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirm */}
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

      {/* Invite instructor */}
      <Dialog open={inviteOpen} onOpenChange={(open) => {
        setInviteOpen(open);
        if (!open) { setInviteQuery(""); setInviteFound(null); setInviteCourseId(""); }
      }}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Presentation className="w-5 h-5 text-amber-400" /> Ustoz taklif qilish
            </DialogTitle>
            <DialogDescription>
              Foydalanuvchini telefon raqami yoki ismi orqali toping va ustoz qilib biror kursga biriktiring.
              Foydalanuvchi avval ro'yxatdan o'tgan bo'lishi kerak.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Telefon yoki ism</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={inviteQuery}
                  onChange={(e) => setInviteQuery(e.target.value)}
                  placeholder="+998901234567 yoki Aliyev"
                  onKeyDown={(e) => e.key === "Enter" && handleInviteSearch()}
                />
                <Button onClick={handleInviteSearch} disabled={inviteSearching} variant="outline">
                  {inviteSearching ? "..." : "Topish"}
                </Button>
              </div>
            </div>

            {inviteFound && (
              <Card className="p-3 bg-secondary/40 border-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                    {inviteFound.full_name?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{inviteFound.full_name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{inviteFound.phone || "—"}</p>
                  </div>
                  {instructorIds.has(inviteFound.user_id) && (
                    <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30">Allaqachon ustoz</Badge>
                  )}
                </div>
              </Card>
            )}

            {inviteFound && (
              <div>
                <Label>Kursga biriktirish (ixtiyoriy)</Label>
                <Select value={inviteCourseId} onValueChange={setInviteCourseId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Kursni tanlang..." />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.icon} {c.title}
                        {c.instructor_id && c.instructor_id !== inviteFound.user_id && (
                          <span className="text-xs text-muted-foreground ml-2">(boshqa ustoz biriktirilgan)</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Eslatma: bitta kursga faqat bitta ustoz biriktiriladi. Tanlasangiz, oldingisi almashtiriladi.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Bekor qilish</Button>
            <Button onClick={handleInviteAssign} disabled={!inviteFound}>
              Ustoz qilib tayinlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
