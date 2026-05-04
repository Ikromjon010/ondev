import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AppHeader from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Plus, Edit, Trash2, ChevronDown, ChevronRight, BookOpen, Eye, EyeOff,
  Users as UsersIcon, BarChart3, GraduationCap, DollarSign, TrendingUp,
  X, Lightbulb, FileText, CheckCircle2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Course {
  id: string; slug: string; title: string; description: string | null;
  icon: string; color: string; language: string; is_published: boolean;
  sort_order: number; instructor_id: string | null;
}
interface Module {
  id: number; course_id: string; tier: string; month: number; title: string; sort_order: number;
}
interface Lesson {
  id: number; module_id: number; title: string; duration: string | null;
  video_url: string | null; content_md: string | null; starter_code: string | null;
  solution_code: string | null; language: string | null; sort_order: number; is_free: boolean;
}

const tierLabel: Record<string, string> = {
  basic: "Boshlang'ich", intermediate: "O'rta", advanced: "Yuqori", free: "Bepul",
};

const Teach = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [expandedModule, setExpandedModule] = useState<number | null>(null);

  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Partial<Module> | null>(null);
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson> | null>(null);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);

  const [students, setStudents] = useState<Array<{ user_id: string; full_name: string; tier: string; granted_at: string; completed: number; points: number }>>([]);
  const [stats, setStats] = useState({ totalRevenue: 0, paidCount: 0, totalEnrolled: 0, completionRate: 0 });

  const [activeTab, setActiveTab] = useState("content");
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("teach_onboarding_dismissed") === "1";
  });
  const dismissBanner = () => {
    setBannerDismissed(true);
    localStorage.setItem("teach_onboarding_dismissed", "1");
  };

  const fetchCourses = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("courses")
      .select("*")
      .eq("instructor_id", user.id)
      .order("sort_order");
    const list = (data as Course[]) || [];
    setCourses(list);
    if (!selectedCourseId && list.length > 0) setSelectedCourseId(list[0].id);
  };

  const fetchContent = async () => {
    if (!selectedCourseId) {
      setModules([]); setLessons([]); return;
    }
    const { data: mods } = await supabase
      .from("modules").select("*")
      .eq("course_id", selectedCourseId).order("sort_order");
    const moduleIds = (mods || []).map((m) => m.id);
    const { data: lsns } = moduleIds.length
      ? await supabase.from("lessons").select("*").in("module_id", moduleIds).order("sort_order")
      : { data: [] };
    setModules((mods as Module[]) || []);
    setLessons((lsns as Lesson[]) || []);
  };

  const fetchStudentsAndStats = async () => {
    if (!selectedCourseId) {
      setStudents([]); setStats({ totalRevenue: 0, paidCount: 0, totalEnrolled: 0, completionRate: 0 });
      return;
    }
    // Enrollments
    const { data: access } = await supabase
      .from("user_course_access")
      .select("user_id, tier, granted_at")
      .eq("course_id", selectedCourseId);
    const accessRows = access || [];
    const userIds = accessRows.map((a) => a.user_id);

    // Profiles
    let profilesMap: Record<string, string> = {};
    if (userIds.length) {
      const { data: profs } = await supabase
        .from("profiles").select("user_id, full_name").in("user_id", userIds);
      (profs || []).forEach((p: any) => { profilesMap[p.user_id] = p.full_name || "—"; });
    }

    // Lessons of this course
    const { data: courseMods } = await supabase
      .from("modules").select("id").eq("course_id", selectedCourseId);
    const courseModuleIds = (courseMods || []).map((m: any) => m.id);
    const { data: courseLessons } = courseModuleIds.length
      ? await supabase.from("lessons").select("id").in("module_id", courseModuleIds)
      : { data: [] };
    const courseLessonIds = (courseLessons || []).map((l: any) => l.id);
    const totalCourseLessons = courseLessonIds.length;

    // Progress for these users on these lessons
    let progressMap: Record<string, { completed: number; points: number }> = {};
    if (userIds.length && courseLessonIds.length) {
      const { data: prog } = await supabase
        .from("user_progress")
        .select("user_id, lesson_id, completed, points_earned")
        .in("user_id", userIds)
        .in("lesson_id", courseLessonIds);
      (prog || []).forEach((p: any) => {
        if (!progressMap[p.user_id]) progressMap[p.user_id] = { completed: 0, points: 0 };
        if (p.completed) progressMap[p.user_id].completed += 1;
        progressMap[p.user_id].points += p.points_earned || 0;
      });
    }

    const studentsList = accessRows.map((a) => ({
      user_id: a.user_id,
      full_name: profilesMap[a.user_id] || "—",
      tier: a.tier,
      granted_at: a.granted_at,
      completed: progressMap[a.user_id]?.completed || 0,
      points: progressMap[a.user_id]?.points || 0,
    })).sort((a, b) => b.completed - a.completed);

    setStudents(studentsList);

    // Payments / revenue
    const { data: pays } = await supabase
      .from("payments")
      .select("amount, status")
      .eq("course_id", selectedCourseId);
    const paid = (pays || []).filter((p: any) => p.status === "completed");
    const revenue = paid.reduce((s: number, p: any) => s + (p.amount || 0), 0);

    const totalCompletions = studentsList.reduce((s, x) => s + x.completed, 0);
    const possible = studentsList.length * totalCourseLessons;
    const completionRate = possible > 0 ? Math.round((totalCompletions / possible) * 100) : 0;

    setStats({
      totalRevenue: revenue,
      paidCount: paid.length,
      totalEnrolled: studentsList.length,
      completionRate,
    });
  };

  useEffect(() => { fetchCourses(); }, [user]);
  useEffect(() => { fetchContent(); fetchStudentsAndStats(); }, [selectedCourseId]);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  // -------- Course (only edit own; cannot reassign instructor_id) --------
  const saveCourse = async () => {
    if (!editingCourse?.title) { toast.error("Sarlavha kerak"); return; }
    const payload = {
      title: editingCourse.title,
      description: editingCourse.description || null,
      icon: editingCourse.icon || "📚",
      language: editingCourse.language || "python",
      is_published: editingCourse.is_published ?? false,
    };
    if (editingCourse.id) {
      const { error } = await supabase.from("courses").update(payload).eq("id", editingCourse.id);
      if (error) { toast.error(error.message); return; }
    }
    toast.success("Saqlandi");
    setCourseDialogOpen(false);
    setEditingCourse(null);
    fetchCourses();
  };

  const togglePublish = async (course: Course) => {
    const { error } = await supabase.from("courses")
      .update({ is_published: !course.is_published })
      .eq("id", course.id);
    if (error) { toast.error(error.message); return; }
    toast.success(course.is_published ? "Yashirildi" : "Chop etildi");
    fetchCourses();
  };

  // -------- Modules --------
  const saveModule = async () => {
    if (!editingModule?.title || !editingModule?.tier) {
      toast.error("Nom va bosqich kerak"); return;
    }
    if (editingModule.id) {
      const { error } = await supabase.from("modules").update({
        title: editingModule.title,
        tier: editingModule.tier,
        month: editingModule.month || 1,
        sort_order: editingModule.sort_order || 0,
      }).eq("id", editingModule.id);
      if (error) { toast.error(error.message); return; }
    } else {
      const { error } = await supabase.from("modules").insert({
        title: editingModule.title,
        tier: editingModule.tier,
        course_id: selectedCourseId,
        month: editingModule.month || 1,
        sort_order: editingModule.sort_order ?? modules.length,
      });
      if (error) { toast.error(error.message); return; }
    }
    toast.success("Modul saqlandi");
    setModuleDialogOpen(false);
    setEditingModule(null);
    fetchContent();
  };

  const deleteModule = async (id: number) => {
    if (!confirm("Bu modul va uning barcha darslari o'chiriladi. Davom etamizmi?")) return;
    const { error } = await supabase.from("modules").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("O'chirildi");
    fetchContent();
  };

  // -------- Lessons --------
  const saveLesson = async () => {
    if (!editingLesson?.title || !editingLesson?.module_id) {
      toast.error("Nom va modul kerak"); return;
    }
    const payload = {
      title: editingLesson.title,
      module_id: editingLesson.module_id,
      duration: editingLesson.duration || "15min",
      video_url: editingLesson.video_url || null,
      content_md: editingLesson.content_md || null,
      starter_code: editingLesson.starter_code || null,
      solution_code: editingLesson.solution_code || null,
      language: editingLesson.language || null,
      sort_order: editingLesson.sort_order || 0,
      is_free: editingLesson.is_free || false,
    };
    if (editingLesson.id) {
      const { error } = await supabase.from("lessons").update(payload).eq("id", editingLesson.id);
      if (error) { toast.error(error.message); return; }
    } else {
      const { error } = await supabase.from("lessons").insert(payload);
      if (error) { toast.error(error.message); return; }
    }
    toast.success("Dars saqlandi");
    setLessonDialogOpen(false);
    setEditingLesson(null);
    fetchContent();
  };

  const deleteLesson = async (id: number) => {
    if (!confirm("Bu darsni o'chirmoqchimisiz?")) return;
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("O'chirildi");
    fetchContent();
  };

  const totalLessons = lessons.length;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-primary" />
              Ustoz paneli
            </h1>
            <p className="text-muted-foreground mt-1">Kurslaringizni boshqaring, o'quvchilar progressini kuzating</p>
          </div>
        </div>

        {courses.length === 0 ? (
          <Card className="glass-card p-10 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-60" />
            <h3 className="font-semibold text-foreground mb-1">Sizga hali kurs biriktirilmagan</h3>
            <p className="text-sm text-muted-foreground">
              Administrator sizni biror kursga ustoz qilib tayinlashi kerak. Iltimos admin bilan bog'laning.
            </p>
          </Card>
        ) : (
          <>
            {/* Course selector */}
            <div className="flex flex-wrap gap-2 mb-6">
              {courses.map((c) => (
                <div
                  key={c.id}
                  className={`flex items-center gap-1 rounded-lg border transition-colors ${
                    selectedCourseId === c.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-muted-foreground/30"
                  }`}
                >
                  <button
                    onClick={() => setSelectedCourseId(c.id)}
                    className="flex items-center gap-2 px-3 py-2 text-sm"
                  >
                    <span className="text-lg">{c.icon}</span>
                    <span className="font-medium text-foreground">{c.title}</span>
                    {!c.is_published && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        Qoralama
                      </span>
                    )}
                  </button>
                  <div className="flex items-center pr-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => togglePublish(c)} title={c.is_published ? "Yashirish" : "Chop etish"}>
                      {c.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditingCourse(c); setCourseDialogOpen(true); }}>
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {selectedCourse && !bannerDismissed && (
              <Card className="glass-card p-5 mb-4 border-amber-500/30 bg-amber-500/5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                    <Lightbulb className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground">Ustoz panelidagi 3 oddiy qadam</h3>
                      <button onClick={dismissBanner} className="text-muted-foreground hover:text-foreground" aria-label="Yopish">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <ol className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                      <li><span className="text-amber-400 font-bold">1.</span> <button onClick={() => setActiveTab("content")} className="hover:text-foreground underline-offset-2 hover:underline">Modul qo'shing</button> — kursni oylar / bosqichlarga bo'ling.</li>
                      <li><span className="text-amber-400 font-bold">2.</span> <button onClick={() => setActiveTab("content")} className="hover:text-foreground underline-offset-2 hover:underline">Darslar yarating</button> — YouTube video, markdown nazariya va vazifalar qo'shing.</li>
                      <li><span className="text-amber-400 font-bold">3.</span> <button onClick={() => setActiveTab("students")} className="hover:text-foreground underline-offset-2 hover:underline">O'quvchilar progressini kuzating</button> va statistikani tahlil qiling.</li>
                    </ol>
                    <p className="text-xs text-muted-foreground mt-3">
                      To'liq qo'llanma uchun{" "}
                      <button onClick={() => setActiveTab("guide")} className="text-amber-400 hover:underline font-medium">
                        Yo'riqnoma
                      </button>{" "}
                      tabini oching.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {selectedCourse && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-card border border-border">
                  <TabsTrigger value="content" className="gap-1"><BookOpen className="w-4 h-4" /> Kontent</TabsTrigger>
                  <TabsTrigger value="students" className="gap-1"><UsersIcon className="w-4 h-4" /> O'quvchilar</TabsTrigger>
                  <TabsTrigger value="stats" className="gap-1"><BarChart3 className="w-4 h-4" /> Statistika</TabsTrigger>
                  <TabsTrigger value="guide" className="gap-1"><FileText className="w-4 h-4" /> Yo'riqnoma</TabsTrigger>
                </TabsList>

                {/* CONTENT */}
                <TabsContent value="content" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">
                      {selectedCourse.icon} {selectedCourse.title} — modullar ({modules.length}) · {totalLessons} ta dars
                    </h2>
                    <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="gap-1" onClick={() => setEditingModule({})}>
                          <Plus className="w-4 h-4" /> Modul qo'shish
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-border">
                        <DialogHeader>
                          <DialogTitle>{editingModule?.id ? "Modulni tahrirlash" : "Yangi modul"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Nomi</Label>
                            <Input value={editingModule?.title || ""} onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })} />
                          </div>
                          <div>
                            <Label>Bosqich</Label>
                            <Select value={editingModule?.tier || ""} onValueChange={(v) => setEditingModule({ ...editingModule, tier: v })}>
                              <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="basic">Boshlang'ich</SelectItem>
                                <SelectItem value="intermediate">O'rta</SelectItem>
                                <SelectItem value="advanced">Yuqori</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Oy</Label>
                              <Input type="number" value={editingModule?.month || 1} onChange={(e) => setEditingModule({ ...editingModule, month: +e.target.value })} />
                            </div>
                            <div>
                              <Label>Tartib</Label>
                              <Input type="number" value={editingModule?.sort_order || 0} onChange={(e) => setEditingModule({ ...editingModule, sort_order: +e.target.value })} />
                            </div>
                          </div>
                          <Button className="w-full" onClick={saveModule}>Saqlash</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="space-y-3">
                    {modules.map((mod) => {
                      const modLessons = lessons.filter((l) => l.module_id === mod.id);
                      const expanded = expandedModule === mod.id;
                      return (
                        <Card key={mod.id} className="glass-card overflow-hidden">
                          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/30" onClick={() => setExpandedModule(expanded ? null : mod.id)}>
                            <div className="flex items-center gap-3">
                              {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                              <BookOpen className="w-4 h-4 text-primary" />
                              <div>
                                <p className="font-medium text-foreground">{mod.month}-oy: {mod.title}</p>
                                <p className="text-xs text-muted-foreground">{tierLabel[mod.tier]} · {modLessons.length} ta dars</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" onClick={() => { setEditingModule(mod); setModuleDialogOpen(true); }}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => deleteModule(mod.id)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </div>

                          {expanded && (
                            <div className="border-t border-border">
                              {modLessons.map((lesson) => (
                                <div key={lesson.id} className="flex items-center justify-between px-4 py-2 border-b border-border/30 last:border-0 hover:bg-secondary/20">
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs text-muted-foreground w-6">{lesson.sort_order}</span>
                                    <span className="text-sm text-foreground">{lesson.title}</span>
                                    {lesson.is_free && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">Bepul</span>}
                                    {lesson.video_url && <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/20 text-accent">Video</span>}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="sm" onClick={() => { setEditingLesson(lesson); setLessonDialogOpen(true); }}>
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => deleteLesson(lesson.id)}>
                                      <Trash2 className="w-3 h-3 text-destructive" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                              <div className="p-3">
                                <Button variant="outline" size="sm" className="gap-1 w-full" onClick={() => { setEditingLesson({ module_id: mod.id, sort_order: modLessons.length + 1 }); setLessonDialogOpen(true); }}>
                                  <Plus className="w-3 h-3" /> Dars qo'shish
                                </Button>
                              </div>
                            </div>
                          )}
                        </Card>
                      );
                    })}

                    {modules.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Bu kursda hali modullar yo'q. Birinchi modulni qo'shing!</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* STUDENTS */}
                <TabsContent value="students">
                  <Card className="glass-card overflow-hidden">
                    <div className="p-4 border-b border-border">
                      <h2 className="font-semibold text-foreground">O'quvchilar ({students.length})</h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-secondary/30 text-xs uppercase text-muted-foreground">
                          <tr>
                            <th className="text-left px-4 py-2">Ism</th>
                            <th className="text-left px-4 py-2">Bosqich</th>
                            <th className="text-left px-4 py-2">Yozilgan</th>
                            <th className="text-right px-4 py-2">Bajargan / {totalLessons}</th>
                            <th className="text-right px-4 py-2">Ball</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.map((s) => {
                            const pct = totalLessons > 0 ? Math.round((s.completed / totalLessons) * 100) : 0;
                            return (
                              <tr key={s.user_id} className="border-t border-border/40 hover:bg-secondary/20">
                                <td className="px-4 py-2 text-foreground">{s.full_name}</td>
                                <td className="px-4 py-2">
                                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-primary/15 text-primary">
                                    {tierLabel[s.tier] || s.tier}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-muted-foreground">{new Date(s.granted_at).toLocaleDateString()}</td>
                                <td className="px-4 py-2 text-right">
                                  <span className="text-foreground font-medium">{s.completed}</span>
                                  <span className="text-muted-foreground ml-1">({pct}%)</span>
                                </td>
                                <td className="px-4 py-2 text-right text-primary font-mono">{s.points}</td>
                              </tr>
                            );
                          })}
                          {students.length === 0 && (
                            <tr>
                              <td colSpan={5} className="text-center py-8 text-muted-foreground">
                                Hali o'quvchilar yo'q
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </TabsContent>

                {/* STATS */}
                <TabsContent value="stats">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card className="glass-card p-5">
                      <div className="flex items-center justify-between mb-2">
                        <UsersIcon className="w-5 h-5 text-primary" />
                        <span className="text-xs text-muted-foreground">Yozilganlar</span>
                      </div>
                      <p className="text-2xl font-bold text-foreground">{stats.totalEnrolled}</p>
                    </Card>
                    <Card className="glass-card p-5">
                      <div className="flex items-center justify-between mb-2">
                        <DollarSign className="w-5 h-5 text-emerald-400" />
                        <span className="text-xs text-muted-foreground">Daromad</span>
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {stats.totalRevenue.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">UZS</span>
                      </p>
                    </Card>
                    <Card className="glass-card p-5">
                      <div className="flex items-center justify-between mb-2">
                        <BarChart3 className="w-5 h-5 text-accent" />
                        <span className="text-xs text-muted-foreground">To'lovlar</span>
                      </div>
                      <p className="text-2xl font-bold text-foreground">{stats.paidCount}</p>
                    </Card>
                    <Card className="glass-card p-5">
                      <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-5 h-5 text-warning" />
                        <span className="text-xs text-muted-foreground">Tugatish darajasi</span>
                      </div>
                      <p className="text-2xl font-bold text-foreground">{stats.completionRate}%</p>
                    </Card>
                  </div>

                  <Card className="glass-card p-5">
                    <h3 className="font-semibold text-foreground mb-3">Top 5 o'quvchi</h3>
                    <div className="space-y-2">
                      {students.slice(0, 5).map((s, i) => (
                        <div key={s.user_id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <span className="w-6 text-center text-muted-foreground">{i + 1}.</span>
                            <span className="text-foreground">{s.full_name}</span>
                          </div>
                          <div className="flex items-center gap-4 text-muted-foreground">
                            <span>{s.completed} dars</span>
                            <span className="text-primary font-mono">{s.points} ball</span>
                          </div>
                        </div>
                      ))}
                      {students.length === 0 && <p className="text-sm text-muted-foreground">Ma'lumot yo'q</p>}
                    </div>
                  </Card>
                </TabsContent>

                {/* GUIDE */}
                <TabsContent value="guide">
                  <Card className="glass-card p-6 max-w-3xl">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="w-5 h-5 text-amber-400" />
                      <h2 className="text-xl font-bold text-foreground">Ustozlar uchun yo'riqnoma</h2>
                    </div>
                    <article className="prose prose-invert prose-sm max-w-none prose-headings:text-foreground prose-headings:font-semibold prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground prose-code:text-amber-400 prose-code:bg-secondary/50 prose-code:px-1 prose-code:rounded prose-a:text-primary">
                      <ReactMarkdown>{INSTRUCTOR_GUIDE_MD}</ReactMarkdown>
                    </article>
                    <div className="mt-6 flex items-center gap-2 p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      Tayyor bo'lsangiz <button onClick={() => setActiveTab("content")} className="underline font-medium">Kontent</button> tabiga o'ting va birinchi modulingizni qo'shing.
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </>
        )}

        {/* Course edit dialog (limited — no slug/instructor) */}
        <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Kursni tahrirlash</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <Label>Ikon</Label>
                  <Input value={editingCourse?.icon || ""} onChange={(e) => setEditingCourse({ ...editingCourse, icon: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Label>Sarlavha</Label>
                  <Input value={editingCourse?.title || ""} onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Til</Label>
                <Select value={editingCourse?.language || "python"} onValueChange={(v) => setEditingCourse({ ...editingCourse, language: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="dart">Dart</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tavsif</Label>
                <Textarea rows={3} value={editingCourse?.description || ""} onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editingCourse?.is_published || false} onCheckedChange={(v) => setEditingCourse({ ...editingCourse, is_published: v })} />
                <Label>Chop etilgan</Label>
              </div>
              <Button className="w-full" onClick={saveCourse}>Saqlash</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Lesson dialog */}
        <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
          <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingLesson?.id ? "Darsni tahrirlash" : "Yangi dars"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Dars nomi</Label>
                <Input value={editingLesson?.title || ""} onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Davomiyligi</Label>
                  <Input value={editingLesson?.duration || "15min"} onChange={(e) => setEditingLesson({ ...editingLesson, duration: e.target.value })} />
                </div>
                <div>
                  <Label>Tartib</Label>
                  <Input type="number" value={editingLesson?.sort_order || 0} onChange={(e) => setEditingLesson({ ...editingLesson, sort_order: +e.target.value })} />
                </div>
                <div className="flex items-end gap-2 pb-1">
                  <Switch checked={editingLesson?.is_free || false} onCheckedChange={(v) => setEditingLesson({ ...editingLesson, is_free: v })} />
                  <Label>Bepul</Label>
                </div>
              </div>
              <div>
                <Label>YouTube video havolasi</Label>
                <Input placeholder="https://youtube.com/watch?v=..." value={editingLesson?.video_url || ""} onChange={(e) => setEditingLesson({ ...editingLesson, video_url: e.target.value })} />
              </div>
              <div>
                <Label>Nazariya (Markdown)</Label>
                <Textarea rows={8} placeholder="## Mavzu nomi&#10;&#10;Dars matni..." value={editingLesson?.content_md || ""} onChange={(e) => setEditingLesson({ ...editingLesson, content_md: e.target.value })} className="font-mono text-sm" />
              </div>
              <div>
                <Label>Boshlang'ich kod</Label>
                <Textarea rows={5} value={editingLesson?.starter_code || ""} onChange={(e) => setEditingLesson({ ...editingLesson, starter_code: e.target.value })} className="font-mono text-sm" />
              </div>
              <div>
                <Label>Yechim kodi</Label>
                <Textarea rows={5} value={editingLesson?.solution_code || ""} onChange={(e) => setEditingLesson({ ...editingLesson, solution_code: e.target.value })} className="font-mono text-sm" />
              </div>
              <Button className="w-full" onClick={saveLesson}>Saqlash</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Teach;
