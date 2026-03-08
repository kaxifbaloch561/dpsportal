import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useClassesData } from "@/hooks/useClassesData";
import { useAuth } from "@/contexts/AuthContext";
import PageShell from "@/components/PageShell";
import DashboardHeader from "@/components/DashboardHeader";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import RichTextEditor from "@/components/admin/RichTextEditor";
import "@/components/admin/rich-editor-styles.css";
import {
  Plus, Trash2, Edit3, Save, BookOpen, ClipboardList, Loader2,
  ChevronRight, ArrowLeft, X
} from "lucide-react";
import { plainTextToHtml } from "@/utils/plainTextToHtml";

const EXERCISE_TYPES = [
  { value: "fill_in_the_blanks", label: "Fill in the Blanks" },
  { value: "choose_correct_answer", label: "Choose the Correct Answer" },
  { value: "match_columns", label: "Match the Columns" },
  { value: "true_false", label: "True and False" },
  { value: "long_question_answers", label: "Long Question Answers" },
  { value: "short_question_answers", label: "Short Question Answers" },
];

interface Chapter {
  id: string;
  chapter_number: number;
  chapter_title: string;
  content: string;
  class_id: number;
  subject_id: string;
}

interface Exercise {
  id: string;
  question: string;
  answer: string | null;
  options: string[] | null;
  correct_option: string | null;
  exercise_type: string;
  sort_order: number;
  chapter_number: number;
  class_id: number;
  subject_id: string;
}

const AdminContentManager = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { data: classesData = [] } = useClassesData();
  const { toast } = useToast();

  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);

  // Chapter form
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [chapterForm, setChapterForm] = useState({ number: "", title: "", content: "" });
  const [savingChapter, setSavingChapter] = useState(false);

  // Exercise management
  const [managingChapter, setManagingChapter] = useState<Chapter | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [exerciseForm, setExerciseForm] = useState({
    type: "",
    question: "",
    answer: "",
    options: "",
    correct_option: "",
    sort_order: "1",
  });
  const [savingExercise, setSavingExercise] = useState(false);

  const selectedClassData = classesData.find((c) => c.id === selectedClass);

  // Fetch chapters
  const fetchChapters = async () => {
    if (!selectedClass || !selectedSubject) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("class_id", selectedClass)
        .eq("subject_id", selectedSubject)
        .order("chapter_number", { ascending: true });
      if (error) {
        toast({ title: "Failed to load chapters", description: error.message, variant: "destructive" });
      }
      setChapters(data || []);
    } catch (err) {
      console.error("Fetch chapters error:", err);
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClass && selectedSubject) fetchChapters();
    else setChapters([]);
  }, [selectedClass, selectedSubject]);

  // Fetch exercises for a chapter
  const fetchExercises = async (ch: Chapter) => {
    setLoadingExercises(true);
    try {
      const { data, error } = await supabase
        .from("chapter_exercises")
        .select("*")
        .eq("class_id", ch.class_id)
        .eq("subject_id", ch.subject_id)
        .eq("chapter_number", ch.chapter_number)
        .order("exercise_type")
        .order("sort_order", { ascending: true });
      if (error) {
        toast({ title: "Failed to load exercises", description: error.message, variant: "destructive" });
      }
      setExercises((data as Exercise[]) || []);
    } catch (err) {
      console.error("Fetch exercises error:", err);
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setLoadingExercises(false);
    }
  };

  useEffect(() => {
    if (managingChapter) fetchExercises(managingChapter);
  }, [managingChapter]);

  if (!isAdmin) {
    return <div className="p-10 text-center text-muted-foreground">Access denied</div>;
  }


  // Chapter CRUD
  const openAddChapter = () => {
    setEditingChapter(null);
    const nextNum = chapters.length > 0 ? Math.max(...chapters.map((c) => c.chapter_number)) + 1 : 1;
    setChapterForm({ number: String(nextNum), title: "", content: "" });
    setShowChapterForm(true);
  };

  const openEditChapter = (ch: Chapter) => {
    setEditingChapter(ch);
    setChapterForm({ number: String(ch.chapter_number), title: ch.chapter_title, content: ch.content });
    setShowChapterForm(true);
  };

  const saveChapter = async () => {
    if (!chapterForm.title.trim() || !chapterForm.content.trim()) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }
    setSavingChapter(true);
    // Auto-convert plain text to professional HTML
    const finalContent = plainTextToHtml(chapterForm.content.trim());
    if (editingChapter) {
      const { error } = await supabase
        .from("chapters")
        .update({
          chapter_number: Number(chapterForm.number),
          chapter_title: chapterForm.title.trim(),
          content: finalContent,
        })
        .eq("id", editingChapter.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Chapter updated!" });
    } else {
      const { error } = await supabase.from("chapters").insert({
        class_id: selectedClass!,
        subject_id: selectedSubject!,
        chapter_number: Number(chapterForm.number),
        chapter_title: chapterForm.title.trim(),
        content: finalContent,
      });
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Chapter added!" });
    }
    setSavingChapter(false);
    setShowChapterForm(false);
    fetchChapters();
  };

  const deleteChapter = async (ch: Chapter) => {
    if (!confirm(`Delete "${ch.chapter_title}"? This will also delete all exercises for this chapter.`)) return;
    try {
      await supabase.from("chapter_exercises").delete().eq("class_id", ch.class_id).eq("subject_id", ch.subject_id).eq("chapter_number", ch.chapter_number);
      const { error } = await supabase.from("chapters").delete().eq("id", ch.id);
      if (error) throw error;
      toast({ title: "Chapter deleted" });
      fetchChapters();
    } catch (err) {
      console.error("Delete chapter error:", err);
      toast({ title: "Failed to delete chapter", variant: "destructive" });
    }
  };

  // Exercise CRUD
  const openAddExercise = () => {
    setEditingExercise(null);
    const nextSort = exercises.length > 0 ? Math.max(...exercises.map((e) => e.sort_order)) + 1 : 1;
    setExerciseForm({ type: "", question: "", answer: "", options: "", correct_option: "", sort_order: String(nextSort) });
    setShowExerciseForm(true);
  };

  const openEditExercise = (ex: Exercise) => {
    setEditingExercise(ex);
    setExerciseForm({
      type: ex.exercise_type,
      question: ex.question,
      answer: ex.answer || "",
      options: Array.isArray(ex.options) ? (ex.options as string[]).join("\n") : "",
      correct_option: ex.correct_option || "",
      sort_order: String(ex.sort_order),
    });
    setShowExerciseForm(true);
  };

  const saveExercise = async () => {
    if (!exerciseForm.type || !exerciseForm.question.trim()) {
      toast({ title: "Type and question are required", variant: "destructive" });
      return;
    }
    setSavingExercise(true);
    const optionsArr = exerciseForm.options.trim() ? exerciseForm.options.trim().split("\n").filter(Boolean) : null;
    const payload = {
      class_id: managingChapter!.class_id,
      subject_id: managingChapter!.subject_id,
      chapter_number: managingChapter!.chapter_number,
      exercise_type: exerciseForm.type,
      question: exerciseForm.question.trim(),
      answer: exerciseForm.answer.trim() || null,
      options: optionsArr,
      correct_option: exerciseForm.correct_option.trim() || null,
      sort_order: Number(exerciseForm.sort_order) || 1,
    };
    if (editingExercise) {
      const { error } = await supabase.from("chapter_exercises").update(payload).eq("id", editingExercise.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Exercise updated!" });
    } else {
      const { error } = await supabase.from("chapter_exercises").insert(payload);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Exercise added!" });
    }
    setSavingExercise(false);
    setShowExerciseForm(false);
    fetchExercises(managingChapter!);
  };

  const deleteExercise = async (ex: Exercise) => {
    if (!confirm("Delete this exercise?")) return;
    try {
      const { error } = await supabase.from("chapter_exercises").delete().eq("id", ex.id);
      if (error) throw error;
      toast({ title: "Exercise deleted" });
      fetchExercises(managingChapter!);
    } catch (err) {
      console.error("Delete exercise error:", err);
      toast({ title: "Failed to delete exercise", variant: "destructive" });
    }
  };

  return (
    <PageShell>
      <DashboardHeader showBack subtitle="Content Manager" />
      <BreadcrumbNav crumbs={[
        { label: "Admin", path: "/admin" },
        { label: "Content Manager" },
      ]} />

      <div className="flex-1 px-4 md:px-8 pb-8 overflow-y-auto">
        {/* Step 1: Select Class & Subject */}
        {!managingChapter && (
          <>
            <div className="flex flex-wrap gap-3 mt-4 mb-6">
              <Select value={selectedClass ? String(selectedClass) : ""} onValueChange={(v) => { setSelectedClass(Number(v)); setSelectedSubject(null); }}>
                <SelectTrigger className="w-44 rounded-xl">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classesData.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedClassData && (
                <Select value={selectedSubject || ""} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-52 rounded-xl">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedClassData.subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Chapters list */}
            {selectedClass && selectedSubject && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <BookOpen size={20} className="text-primary" /> Chapters
                  </h2>
                  <Button onClick={openAddChapter} className="rounded-xl gap-2">
                    <Plus size={16} /> Add Chapter
                  </Button>
                </div>

                {loading ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                ) : chapters.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">No chapters yet. Add one!</p>
                ) : (
                  <div className="space-y-2">
                    {chapters.map((ch) => (
                      <div key={ch.id} className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl hover:shadow-md transition-all">
                        <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary text-sm font-black flex items-center justify-center shrink-0">
                          {ch.chapter_number}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{ch.chapter_title}</p>
                          <p className="text-xs text-muted-foreground truncate">{ch.content.slice(0, 80)}...</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="ghost" size="icon" onClick={() => { setManagingChapter(ch); }} title="Manage Exercises">
                            <ClipboardList size={16} className="text-primary" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditChapter(ch)} title="Edit">
                            <Edit3 size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteChapter(ch)} title="Delete">
                            <Trash2 size={16} className="text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Step 2: Exercise management for a chapter */}
        {managingChapter && (
          <div>
            <Button variant="ghost" onClick={() => { setManagingChapter(null); setExercises([]); }} className="mb-4 gap-2 text-muted-foreground">
              <ArrowLeft size={16} /> Back to Chapters
            </Button>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">
                Ch {managingChapter.chapter_number}: {managingChapter.chapter_title} — Exercises
              </h2>
              <Button onClick={openAddExercise} className="rounded-xl gap-2">
                <Plus size={16} /> Add Exercise
              </Button>
            </div>

            {loadingExercises ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : exercises.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No exercises yet. Add one!</p>
            ) : (
              <div className="space-y-2">
                {exercises.map((ex, idx) => {
                  const typeLabel = EXERCISE_TYPES.find((t) => t.value === ex.exercise_type)?.label || ex.exercise_type;
                  return (
                    <div key={ex.id} className="flex items-start gap-3 p-4 bg-card border border-border rounded-2xl">
                      <span className="w-8 h-8 rounded-lg bg-accent/15 text-accent-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{typeLabel}</span>
                        <p className="font-medium text-foreground text-sm mt-1 truncate">{ex.question}</p>
                        {ex.answer && <p className="text-xs text-muted-foreground mt-0.5 truncate">Ans: {ex.answer.slice(0, 100)}</p>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => openEditExercise(ex)} title="Edit">
                          <Edit3 size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteExercise(ex)} title="Delete">
                          <Trash2 size={14} className="text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chapter Form Dialog */}
      <Dialog open={showChapterForm} onOpenChange={setShowChapterForm}>
        <DialogContent className="rounded-3xl max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingChapter ? "Edit Chapter" : "Add Chapter"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="flex gap-3">
              <div className="w-32">
                <label className="text-sm font-medium text-foreground mb-1 block">Chapter #</label>
                <Input type="number" value={chapterForm.number} onChange={(e) => setChapterForm((p) => ({ ...p, number: e.target.value }))} className="rounded-xl" />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground mb-1 block">Title</label>
                <Input value={chapterForm.title} onChange={(e) => setChapterForm((p) => ({ ...p, title: e.target.value }))} className="rounded-xl" placeholder="Chapter title..." />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Content</label>
              <RichTextEditor
                content={chapterForm.content}
                onChange={(html) => setChapterForm((p) => ({ ...p, content: html }))}
                placeholder="Start writing the chapter content... Use headings, bold, bullets, and insert images."
              />
            </div>
            <Button onClick={saveChapter} disabled={savingChapter} className="w-full rounded-full gap-2">
              <Save size={16} /> {savingChapter ? "Saving..." : editingChapter ? "Update Chapter" : "Add Chapter"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exercise Form Dialog */}
      <Dialog open={showExerciseForm} onOpenChange={setShowExerciseForm}>
        <DialogContent className="rounded-3xl max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingExercise ? "Edit Exercise" : "Add Exercise"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Exercise Type</label>
              <Select value={exerciseForm.type} onValueChange={(v) => setExerciseForm((p) => ({ ...p, type: v }))}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  {EXERCISE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Question</label>
              <Textarea value={exerciseForm.question} onChange={(e) => setExerciseForm((p) => ({ ...p, question: e.target.value }))} className="rounded-xl min-h-[80px]" placeholder="Enter question..." />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Answer</label>
              <Textarea value={exerciseForm.answer} onChange={(e) => setExerciseForm((p) => ({ ...p, answer: e.target.value }))} className="rounded-xl min-h-[80px]" placeholder="Enter answer..." />
            </div>
            {(exerciseForm.type === "choose_correct_answer" || exerciseForm.type === "true_false") && (
              <>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Options (one per line)</label>
                  <Textarea value={exerciseForm.options} onChange={(e) => setExerciseForm((p) => ({ ...p, options: e.target.value }))} className="rounded-xl min-h-[80px]" placeholder={"Option A\nOption B\nOption C\nOption D"} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Correct Option</label>
                  <Input value={exerciseForm.correct_option} onChange={(e) => setExerciseForm((p) => ({ ...p, correct_option: e.target.value }))} className="rounded-xl" placeholder="e.g. A or True" />
                </div>
              </>
            )}
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Sort Order</label>
              <Input type="number" value={exerciseForm.sort_order} onChange={(e) => setExerciseForm((p) => ({ ...p, sort_order: e.target.value }))} className="rounded-xl" />
            </div>
            <Button onClick={saveExercise} disabled={savingExercise} className="w-full rounded-full gap-2">
              <Save size={16} /> {savingExercise ? "Saving..." : editingExercise ? "Update Exercise" : "Add Exercise"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
};

export default AdminContentManager;
