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
  ChevronRight, ArrowLeft, X, Sparkles, Bot, CheckCircle2, AlertCircle
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

interface AIExercise {
  question: string;
  answer: string | null;
  options: string[] | null;
  correct_option: string | null;
  exercise_type: string;
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

  // AI Smart Upload
  const [showAIUpload, setShowAIUpload] = useState(false);
  const [aiRawText, setAiRawText] = useState("");
  const [aiChapterNum, setAiChapterNum] = useState("");
  const [aiChapterTitle, setAiChapterTitle] = useState("");
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiPreview, setAiPreview] = useState<{
    chapterContent: string;
    exercises: AIExercise[];
  } | null>(null);
  const [aiSaving, setAiSaving] = useState(false);

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
      if (error) toast({ title: "Failed to load chapters", description: error.message, variant: "destructive" });
      setChapters(data || []);
    } catch {
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
      if (error) toast({ title: "Failed to load exercises", description: error.message, variant: "destructive" });
      setExercises((data as Exercise[]) || []);
    } catch {
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
    } catch {
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
    } catch {
      toast({ title: "Failed to delete exercise", variant: "destructive" });
    }
  };

  // AI Smart Upload
  const openAIUpload = () => {
    const nextNum = chapters.length > 0 ? Math.max(...chapters.map((c) => c.chapter_number)) + 1 : 1;
    setAiChapterNum(String(nextNum));
    setAiChapterTitle("");
    setAiRawText("");
    setAiPreview(null);
    setShowAIUpload(true);
  };

  const processWithAI = async () => {
    if (!aiRawText.trim() || !aiChapterTitle.trim() || !aiChapterNum.trim()) {
      toast({ title: "Please fill chapter number, title, and paste the raw text", variant: "destructive" });
      return;
    }
    setAiProcessing(true);
    setAiPreview(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-content-manager", {
        body: {
          rawText: aiRawText.trim(),
          chapterNumber: Number(aiChapterNum),
          chapterTitle: aiChapterTitle.trim(),
          classId: selectedClass,
          subjectId: selectedSubject,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.chapterContent || !Array.isArray(data?.exercises)) {
        throw new Error("Invalid AI response");
      }
      setAiPreview(data);
      toast({ title: "✨ AI processing complete!", description: `Chapter formatted + ${data.exercises.length} exercises extracted` });
    } catch (err: any) {
      console.error("AI processing error:", err);
      toast({
        title: "AI Processing Failed",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setAiProcessing(false);
    }
  };

  const saveAIContent = async () => {
    if (!aiPreview || !selectedClass || !selectedSubject) return;
    setAiSaving(true);
    try {
      const chapterNum = Number(aiChapterNum);

      // Check if chapter already exists
      const { data: existing } = await supabase
        .from("chapters")
        .select("id")
        .eq("class_id", selectedClass)
        .eq("subject_id", selectedSubject)
        .eq("chapter_number", chapterNum)
        .maybeSingle();

      if (existing) {
        // Update existing chapter
        const { error } = await supabase
          .from("chapters")
          .update({ chapter_title: aiChapterTitle.trim(), content: aiPreview.chapterContent })
          .eq("id", existing.id);
        if (error) throw error;

        // Delete old exercises for this chapter
        await supabase
          .from("chapter_exercises")
          .delete()
          .eq("class_id", selectedClass)
          .eq("subject_id", selectedSubject)
          .eq("chapter_number", chapterNum);
      } else {
        // Insert new chapter
        const { error } = await supabase.from("chapters").insert({
          class_id: selectedClass,
          subject_id: selectedSubject,
          chapter_number: chapterNum,
          chapter_title: aiChapterTitle.trim(),
          content: aiPreview.chapterContent,
        });
        if (error) throw error;
      }

      // Insert exercises
      if (aiPreview.exercises.length > 0) {
        const exercisePayloads = aiPreview.exercises.map((ex, idx) => ({
          class_id: selectedClass,
          subject_id: selectedSubject,
          chapter_number: chapterNum,
          exercise_type: ex.exercise_type,
          question: ex.question,
          answer: ex.answer || null,
          options: ex.options || null,
          correct_option: ex.correct_option || null,
          sort_order: idx + 1,
        }));

        const { error: exError } = await supabase.from("chapter_exercises").insert(exercisePayloads);
        if (exError) throw exError;
      }

      toast({
        title: "🎉 Chapter & Exercises Saved!",
        description: `Chapter ${chapterNum} with ${aiPreview.exercises.length} exercises saved successfully.`,
      });
      setShowAIUpload(false);
      setAiPreview(null);
      fetchChapters();
    } catch (err: any) {
      console.error("Save AI content error:", err);
      toast({ title: "Failed to save", description: err.message, variant: "destructive" });
    } finally {
      setAiSaving(false);
    }
  };

  // Group exercises by type for preview
  const groupedExercises = aiPreview?.exercises.reduce((acc, ex) => {
    if (!acc[ex.exercise_type]) acc[ex.exercise_type] = [];
    acc[ex.exercise_type].push(ex);
    return acc;
  }, {} as Record<string, AIExercise[]>) || {};

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
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <BookOpen size={20} className="text-primary" /> Chapters
                  </h2>
                  <div className="flex items-center gap-2">
                    {/* AI Smart Upload Button */}
                    <Button onClick={openAIUpload} variant="outline" className="rounded-xl gap-2 border-primary/30 text-primary hover:bg-primary/10">
                      <Bot size={16} /> AI Smart Upload
                    </Button>
                    <Button onClick={openAddChapter} className="rounded-xl gap-2">
                      <Plus size={16} /> Add Chapter
                    </Button>
                  </div>
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

      {/* AI Smart Upload Dialog */}
      <Dialog open={showAIUpload} onOpenChange={(open) => { if (!aiProcessing && !aiSaving) setShowAIUpload(open); }}>
        <DialogContent className="rounded-3xl max-w-4xl max-h-[92vh] overflow-hidden flex flex-col p-0">
          {/* Header */}
          <div className="px-6 pt-5 pb-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg, hsl(235,78%,62%), hsl(270,72%,55%))", boxShadow: "0 8px 24px -4px hsl(235 78% 62% / 0.3)" }}>
                <Bot size={22} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-foreground tracking-tight">AI Smart Upload</h2>
                <p className="text-xs text-muted-foreground">Paste raw text → AI formats chapter & extracts exercises automatically</p>
              </div>
            </div>
          </div>

          {/* Content area - scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {!aiPreview ? (
              <>
                {/* Input form */}
                <div className="flex gap-3">
                  <div className="w-28">
                    <label className="text-xs font-semibold text-foreground mb-1 block">Chapter #</label>
                    <Input type="number" value={aiChapterNum} onChange={(e) => setAiChapterNum(e.target.value)} className="rounded-xl" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-foreground mb-1 block">Chapter Title</label>
                    <Input value={aiChapterTitle} onChange={(e) => setAiChapterTitle(e.target.value)} className="rounded-xl" placeholder="e.g. Economic Developments (Part-I)" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Raw Chapter Text (with exercises)
                  </label>
                  <Textarea
                    value={aiRawText}
                    onChange={(e) => setAiRawText(e.target.value)}
                    className="rounded-xl min-h-[300px] font-mono text-xs leading-relaxed"
                    placeholder={`Paste the entire chapter text here including exercises...

Example:
Learning Outcomes
The study of this chapter will enable students to:
- Discuss economic developments...
- Describe major resources...

1. Economic Development in Pakistan
At the time of independence in 1947...

EXERCISES
Fill in the Blanks:
1. Pakistan came into being on ________.
   (a) 1947  (b) 1948  (c) 1949

Choose the Correct Answer:
1. Who was the first president?
   a) Ayub Khan  b) Iskander Mirza  c) Bhutto  d) Zia
   Answer: b

True and False:
1. Pakistan is an agricultural country. (Tick/Cross)

Short Questions:
1. Define "GDP".
Answer: GDP stands for...

Long Questions:
1. Describe the economic reforms during 1971-77.
Answer: The economic reforms...`}
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {aiRawText.length > 0 ? `${aiRawText.length.toLocaleString()} characters` : "Paste the complete chapter text with all exercises included"}
                  </p>
                </div>

                {/* Info card */}
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles size={18} className="text-primary shrink-0 mt-0.5" />
                    <div className="text-xs text-foreground/80 space-y-1.5">
                      <p className="font-bold text-foreground">What AI will do:</p>
                      <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                        <li>Format chapter with proper headings, paragraphs, bullets & tables</li>
                        <li>Extract all exercises and categorize them (MCQs, Fill blanks, True/False, Q&A)</li>
                        <li>Match the exact formatting style of your existing chapters</li>
                        <li>Preview everything before saving — you stay in control</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* AI Preview Results */}
                <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-4 flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-green-500 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-foreground">AI Processing Complete!</p>
                    <p className="text-xs text-muted-foreground">
                      Chapter formatted + {aiPreview.exercises.length} exercises extracted across{" "}
                      {Object.keys(groupedExercises).length} categories
                    </p>
                  </div>
                </div>

                {/* Chapter content preview */}
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                    <BookOpen size={14} className="text-primary" /> Chapter Content Preview
                  </h3>
                  <div
                    className="rounded-2xl border border-border bg-card p-4 max-h-[200px] overflow-y-auto prose prose-sm max-w-none text-foreground chapter-html-content"
                    dangerouslySetInnerHTML={{ __html: aiPreview.chapterContent.slice(0, 3000) + (aiPreview.chapterContent.length > 3000 ? "..." : "") }}
                  />
                </div>

                {/* Exercises preview */}
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                    <ClipboardList size={14} className="text-primary" /> Exercises Preview ({aiPreview.exercises.length} total)
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(groupedExercises).map(([type, exList]) => {
                      const typeLabel = EXERCISE_TYPES.find(t => t.value === type)?.label || type;
                      return (
                        <div key={type} className="rounded-2xl border border-border bg-card overflow-hidden">
                          <div className="px-4 py-2.5 bg-muted/30 border-b border-border/60 flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground">{typeLabel}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              {exList.length} questions
                            </span>
                          </div>
                          <div className="divide-y divide-border/40 max-h-[150px] overflow-y-auto">
                            {exList.map((ex, i) => (
                              <div key={i} className="px-4 py-2 flex items-start gap-2">
                                <span className="text-[10px] font-bold text-muted-foreground w-5 shrink-0 pt-0.5">{i + 1}.</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-foreground truncate">{ex.question}</p>
                                  {ex.answer && (
                                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">Ans: {ex.answer.slice(0, 80)}</p>
                                  )}
                                  {ex.options && (
                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                      Options: {ex.options.join(" | ")}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border/60 bg-muted/20 flex items-center justify-between gap-3">
            {!aiPreview ? (
              <>
                <Button variant="ghost" onClick={() => setShowAIUpload(false)} disabled={aiProcessing}>
                  Cancel
                </Button>
                <Button
                  onClick={processWithAI}
                  disabled={aiProcessing || !aiRawText.trim() || !aiChapterTitle.trim()}
                  className="rounded-xl gap-2 px-6"
                  style={{ background: "linear-gradient(135deg, hsl(235,78%,62%), hsl(270,72%,55%))" }}
                >
                  {aiProcessing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      AI Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Process with AI
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setAiPreview(null)} disabled={aiSaving}>
                  <ArrowLeft size={14} className="mr-1" /> Re-process
                </Button>
                <Button
                  onClick={saveAIContent}
                  disabled={aiSaving}
                  className="rounded-xl gap-2 px-6 bg-green-600 hover:bg-green-700 text-white"
                >
                  {aiSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Chapter & {aiPreview.exercises.length} Exercises
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
};

export default AdminContentManager;
