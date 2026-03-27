import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, BookOpen } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Module {
  id: number;
  tier: string;
  month: number;
  title: string;
  sort_order: number;
}

interface Lesson {
  id: number;
  module_id: number;
  title: string;
  duration: string | null;
  video_url: string | null;
  content_md: string | null;
  starter_code: string | null;
  solution_code: string | null;
  sort_order: number;
  is_free: boolean;
}

const AdminContent = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [editingModule, setEditingModule] = useState<Partial<Module> | null>(null);
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson> | null>(null);
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);

  const fetchData = async () => {
    const [{ data: mods }, { data: lsns }] = await Promise.all([
      supabase.from("modules").select("*").order("sort_order"),
      supabase.from("lessons").select("*").order("sort_order"),
    ]);
    setModules(mods || []);
    setLessons(lsns || []);
  };

  useEffect(() => { fetchData(); }, []);

  const saveModule = async () => {
    if (!editingModule?.title || !editingModule?.tier) return;
    if (editingModule.id) {
      await supabase.from("modules").update({
        title: editingModule.title,
        tier: editingModule.tier,
        month: editingModule.month || 1,
        sort_order: editingModule.sort_order || 0,
      }).eq("id", editingModule.id);
    } else {
      await supabase.from("modules").insert({
        title: editingModule.title,
        tier: editingModule.tier,
        month: editingModule.month || 1,
        sort_order: editingModule.sort_order || modules.length,
      });
    }
    toast.success("Modul saqlandi");
    setModuleDialogOpen(false);
    setEditingModule(null);
    fetchData();
  };

  const deleteModule = async (id: number) => {
    if (!confirm("Bu modulni o'chirmoqchimisiz? Barcha darslari ham o'chiriladi.")) return;
    await supabase.from("modules").delete().eq("id", id);
    toast.success("Modul o'chirildi");
    fetchData();
  };

  const saveLesson = async () => {
    if (!editingLesson?.title || !editingLesson?.module_id) return;
    const payload = {
      title: editingLesson.title,
      module_id: editingLesson.module_id,
      duration: editingLesson.duration || "15min",
      video_url: editingLesson.video_url || null,
      content_md: editingLesson.content_md || null,
      starter_code: editingLesson.starter_code || null,
      solution_code: editingLesson.solution_code || null,
      sort_order: editingLesson.sort_order || 0,
      is_free: editingLesson.is_free || false,
    };
    if (editingLesson.id) {
      await supabase.from("lessons").update(payload).eq("id", editingLesson.id);
    } else {
      await supabase.from("lessons").insert(payload);
    }
    toast.success("Dars saqlandi");
    setLessonDialogOpen(false);
    setEditingLesson(null);
    fetchData();
  };

  const deleteLesson = async (id: number) => {
    if (!confirm("Bu darsni o'chirmoqchimisiz?")) return;
    await supabase.from("lessons").delete().eq("id", id);
    toast.success("Dars o'chirildi");
    fetchData();
  };

  const tierLabel: Record<string, string> = { basic: "Boshlang'ich", intermediate: "O'rta", advanced: "Yuqori" };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Kurs kontenti</h1>
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
            <p>Hozircha modullar yo'q. Birinchi modulni qo'shing!</p>
          </div>
        )}
      </div>

      {/* Lesson Dialog */}
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
                <Label>Bepul dars</Label>
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
              <Textarea rows={5} placeholder="# Talaba uchun boshlang'ich kod" value={editingLesson?.starter_code || ""} onChange={(e) => setEditingLesson({ ...editingLesson, starter_code: e.target.value })} className="font-mono text-sm" />
            </div>
            <div>
              <Label>Yechim kodi</Label>
              <Textarea rows={5} placeholder="# To'g'ri yechim" value={editingLesson?.solution_code || ""} onChange={(e) => setEditingLesson({ ...editingLesson, solution_code: e.target.value })} className="font-mono text-sm" />
            </div>
            <Button className="w-full" onClick={saveLesson}>Saqlash</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminContent;
