import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2, Check, X, ArrowLeft, BookOpen, GraduationCap } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface ClassItem {
  id: number;
  name: string;
  sort_order: number;
}

interface SubjectItem {
  id: string;
  class_id: number;
  name: string;
  icon: string;
  sort_order: number;
}

const ICON_OPTIONS = [
  { value: "BookText", label: "📖 Book" },
  { value: "Calculator", label: "🧮 Math" },
  { value: "PenLine", label: "✒️ Pen" },
  { value: "Moon", label: "🌙 Moon" },
  { value: "Atom", label: "⚛️ Atom" },
  { value: "Globe", label: "🌍 Globe" },
  { value: "FlaskConical", label: "🧪 Flask" },
  { value: "Monitor", label: "💻 Computer" },
  { value: "BookOpen", label: "📚 BookOpen" },
  { value: "Palette", label: "🎨 Art" },
  { value: "Music", label: "🎵 Music" },
  { value: "Dumbbell", label: "💪 Sports" },
];

const AdminClassesManager = () => {
  const queryClient = useQueryClient();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);

  // Add class state
  const [newClassName, setNewClassName] = useState("");
  const [editingClassId, setEditingClassId] = useState<number | null>(null);
  const [editClassName, setEditClassName] = useState("");

  // Add subject state
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectId, setNewSubjectId] = useState("");
  const [newSubjectIcon, setNewSubjectIcon] = useState("BookOpen");
  const [editingSubjectKey, setEditingSubjectKey] = useState<string | null>(null);
  const [editSubjectName, setEditSubjectName] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const [classRes, subRes] = await Promise.all([
      supabase.from("classes").select("*").order("sort_order"),
      supabase.from("subjects").select("*").order("sort_order"),
    ]);
    if (classRes.data) setClasses(classRes.data as any);
    if (subRes.data) setSubjects(subRes.data as any);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["classes-data"] });

  // ─── Class CRUD ───
  const addClass = async () => {
    if (!newClassName.trim()) return;
    const maxOrder = classes.length > 0 ? Math.max(...classes.map(c => c.sort_order)) : 0;
    const { error } = await supabase.from("classes").insert({
      name: newClassName.trim(),
      sort_order: maxOrder + 1,
    } as any);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "✅ Class added!" });
    setNewClassName("");
    fetchData();
    invalidate();
  };

  const updateClass = async (id: number) => {
    if (!editClassName.trim()) return;
    const { error } = await supabase.from("classes").update({ name: editClassName.trim() } as any).eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "✅ Class updated!" });
    setEditingClassId(null);
    fetchData();
    invalidate();
  };

  const deleteClass = async (id: number) => {
    const { error } = await supabase.from("classes").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Class deleted" });
    if (selectedClass?.id === id) setSelectedClass(null);
    fetchData();
    invalidate();
  };

  // ─── Subject CRUD ───
  const addSubject = async () => {
    if (!selectedClass || !newSubjectName.trim() || !newSubjectId.trim()) return;
    const classSubjects = subjects.filter(s => s.class_id === selectedClass.id);
    const maxOrder = classSubjects.length > 0 ? Math.max(...classSubjects.map(s => s.sort_order)) : 0;
    const { error } = await supabase.from("subjects").insert({
      id: newSubjectId.trim().toLowerCase().replace(/\s+/g, "-"),
      class_id: selectedClass.id,
      name: newSubjectName.trim(),
      icon: newSubjectIcon,
      sort_order: maxOrder + 1,
    } as any);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "✅ Subject added!" });
    setNewSubjectName("");
    setNewSubjectId("");
    setNewSubjectIcon("BookOpen");
    fetchData();
    invalidate();
  };

  const updateSubject = async (id: string, classId: number) => {
    if (!editSubjectName.trim()) return;
    const { error } = await supabase.from("subjects").update({ name: editSubjectName.trim() } as any)
      .eq("id", id).eq("class_id", classId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "✅ Subject updated!" });
    setEditingSubjectKey(null);
    fetchData();
    invalidate();
  };

  const deleteSubject = async (id: string, classId: number) => {
    const { error } = await supabase.from("subjects").delete().eq("id", id).eq("class_id", classId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Subject deleted" });
    fetchData();
    invalidate();
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;

  // ─── Subject Detail View ───
  if (selectedClass) {
    const classSubjects = subjects.filter(s => s.class_id === selectedClass.id);
    return (
      <div className="px-6 pb-6" style={{ animation: "slideUp 0.4s ease forwards" }}>
        <button
          onClick={() => setSelectedClass(null)}
          className="flex items-center gap-2 text-sm text-primary font-semibold mb-4 hover:underline"
        >
          <ArrowLeft size={16} /> Back to Classes
        </button>

        <div className="bg-card rounded-3xl border border-border p-5 mb-4">
          <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
            <GraduationCap size={20} className="text-primary" />
            {selectedClass.name} — Subjects
          </h3>
          <p className="text-xs text-muted-foreground">{classSubjects.length} subjects</p>
        </div>

        {/* Add subject form */}
        <div className="bg-muted/50 rounded-2xl p-4 mb-4 space-y-3">
          <p className="text-sm font-bold text-foreground">Add New Subject</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Input
              placeholder="Subject ID (e.g. physics)"
              value={newSubjectId}
              onChange={(e) => setNewSubjectId(e.target.value)}
              className="rounded-xl text-sm"
            />
            <Input
              placeholder="Display Name (e.g. Physics)"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              className="rounded-xl text-sm"
            />
            <select
              value={newSubjectIcon}
              onChange={(e) => setNewSubjectIcon(e.target.value)}
              className="rounded-xl border border-input bg-background px-3 py-2 text-sm"
            >
              {ICON_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <Button size="sm" className="rounded-full" onClick={addSubject}>
            <Plus size={14} /> Add Subject
          </Button>
        </div>

        {/* Subject list */}
        <div className="space-y-2">
          {classSubjects.map((sub) => {
            const subKey = `${sub.id}-${sub.class_id}`;
            const isEditing = editingSubjectKey === subKey;
            return (
              <div
                key={subKey}
                className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border hover:border-primary/20 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <BookOpen size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editSubjectName}
                        onChange={(e) => setEditSubjectName(e.target.value)}
                        className="rounded-xl text-sm h-8"
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && updateSubject(sub.id, sub.class_id)}
                      />
                      <button onClick={() => updateSubject(sub.id, sub.class_id)} className="text-primary"><Check size={16} /></button>
                      <button onClick={() => setEditingSubjectKey(null)} className="text-muted-foreground"><X size={16} /></button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-foreground">{sub.name}</p>
                      <p className="text-[10px] text-muted-foreground">ID: {sub.id}</p>
                    </>
                  )}
                </div>
                {!isEditing && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => { setEditingSubjectKey(subKey); setEditSubjectName(sub.name); }}
                      className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-primary"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => deleteSubject(sub.id, sub.class_id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {classSubjects.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">No subjects yet</div>
          )}
        </div>
      </div>
    );
  }

  // ─── Classes List View ───
  return (
    <div className="px-6 pb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <GraduationCap size={20} className="text-primary" />
          Classes & Subjects
        </h3>
        <span className="text-xs text-muted-foreground">{classes.length} classes</span>
      </div>

      {/* Add class form */}
      <div className="flex items-center gap-2 mb-4">
        <Input
          placeholder="New class name (e.g. Class 11)"
          value={newClassName}
          onChange={(e) => setNewClassName(e.target.value)}
          className="rounded-xl text-sm"
          onKeyDown={(e) => e.key === "Enter" && addClass()}
        />
        <Button size="sm" className="rounded-full shrink-0" onClick={addClass}>
          <Plus size={14} /> Add
        </Button>
      </div>

      {/* Classes list */}
      <div className="space-y-2">
        {classes.map((cls) => {
          const clsSubjects = subjects.filter(s => s.class_id === cls.id);
          const isEditing = editingClassId === cls.id;
          return (
            <div
              key={cls.id}
              className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border hover:shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.15)] hover:-translate-y-0.5 hover:border-primary/20 transition-all duration-300"
            >
              <button
                onClick={() => !isEditing && setSelectedClass(cls)}
                className="flex items-center gap-3 flex-1 min-w-0 text-left"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                  {cls.id}
                </div>
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Input
                        value={editClassName}
                        onChange={(e) => setEditClassName(e.target.value)}
                        className="rounded-xl text-sm h-8"
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && updateClass(cls.id)}
                      />
                      <button onClick={() => updateClass(cls.id)} className="text-primary"><Check size={16} /></button>
                      <button onClick={() => setEditingClassId(null)} className="text-muted-foreground"><X size={16} /></button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-foreground">{cls.name}</p>
                      <p className="text-[10px] text-muted-foreground">{clsSubjects.length} subjects</p>
                    </>
                  )}
                </div>
              </button>
              {!isEditing && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => { setEditingClassId(cls.id); setEditClassName(cls.name); }}
                    className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-primary"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => deleteClass(cls.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminClassesManager;
