import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Loader2, Shuffle, FileText, Copy, Check, Download, RefreshCw, ArrowLeft, ChevronUp, ChevronDown, Trash2, Hand, Lock, Unlock, Replace, Search } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

interface MakeAPaperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: number;
  subjectId: string;
  className: string;
  subjectName: string;
}

type PaperMode = "random" | "manual";
type Step = "mode" | "chapters" | "config" | "paper" | "manual-browse" | "manual-review" | "replace";

interface PaperQuestion {
  id: string;
  type: string;
  question: string;
  options?: string[];
  correct_option?: string;
}

const QUESTION_TYPES = [
  { key: "long_question_answers", label: "Long Question Answers" },
  { key: "short_question_answers", label: "Short Question Answers" },
  { key: "fill_in_the_blanks", label: "Fill in the Blanks" },
  { key: "match_columns", label: "Match the Columns" },
  { key: "true_false", label: "True / False" },
  { key: "choose_correct_answer", label: "Choose the Correct Answer" },
] as const;

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const MakeAPaper = ({ open, onOpenChange, classId, subjectId, className: clsName, subjectName }: MakeAPaperProps) => {
  const [step, setStep] = useState<Step>("mode");
  const [mode, setMode] = useState<PaperMode>("random");
  const [selectedChapters, setSelectedChapters] = useState<number[]>([]);
  const [config, setConfig] = useState<Record<string, number>>({});
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [paper, setPaper] = useState<PaperQuestion[]>([]);
  const [allExercises, setAllExercises] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({});

  // Lock & Replace state
  const [lockedIds, setLockedIds] = useState<Set<string>>(new Set());
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const [replaceSearch, setReplaceSearch] = useState("");

  // Manual mode state
  const [manualExercises, setManualExercises] = useState<any[]>([]);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualSelected, setManualSelected] = useState<Set<string>>(new Set());
  const [expandedType, setExpandedType] = useState<string | null>(null);
  const [manualSearches, setManualSearches] = useState<Record<string, string>>({});

  // Fetch chapters list
  const { data: chapters, isLoading: chaptersLoading } = useQuery({
    queryKey: ["chapters-list", classId, subjectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapters")
        .select("chapter_number, chapter_title")
        .eq("class_id", classId)
        .eq("subject_id", subjectId)
        .order("chapter_number", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const resetState = () => {
    setStep("mode");
    setMode("random");
    setSelectedChapters([]);
    setPaper([]);
    setAllExercises([]);
    setConfig({});
    setAvailableTypes([]);
    setTypeCounts({});
    setManualExercises([]);
    setManualSelected(new Set());
    setExpandedType(null);
    setManualSearches({});
    setLockedIds(new Set());
    setReplaceIndex(null);
    setReplaceSearch("");
  };

  const fetchAvailableTypes = async () => {
    setLoadingTypes(true);
    try {
      const { data, error } = await supabase
        .from("chapter_exercises")
        .select("exercise_type")
        .eq("class_id", classId)
        .eq("subject_id", subjectId)
        .in("chapter_number", selectedChapters);
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach((d: any) => {
        counts[d.exercise_type] = (counts[d.exercise_type] || 0) + 1;
      });
      setTypeCounts(counts);
      const types = Object.keys(counts);
      setAvailableTypes(types);
      const defaults: Record<string, number> = {};
      types.forEach((t) => {
        defaults[t] = t === "long_question_answers" ? 3 : 5;
      });
      setConfig(defaults);
    } catch {
      toast.error("Failed to load exercise types");
    } finally {
      setLoadingTypes(false);
    }
  };

  const fetchManualExercises = async () => {
    setManualLoading(true);
    try {
      const { data, error } = await supabase
        .from("chapter_exercises")
        .select("*")
        .eq("class_id", classId)
        .eq("subject_id", subjectId)
        .in("chapter_number", selectedChapters)
        .order("exercise_type")
        .order("sort_order");
      if (error) throw error;
      setManualExercises(data || []);
      const types = [...new Set((data || []).map((d: any) => d.exercise_type))];
      if (types.length > 0) setExpandedType(types[0]);
    } catch {
      toast.error("Failed to load exercises");
    } finally {
      setManualLoading(false);
    }
  };

  const handleClose = (val: boolean) => {
    if (!val) resetState();
    onOpenChange(val);
  };

  const toggleChapter = (num: number) => {
    setSelectedChapters((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  const toggleManualQuestion = (id: string) => {
    setManualSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllOfType = (typeKey: string) => {
    const typeExercises = manualExercises.filter((e) => e.exercise_type === typeKey);
    const allSelected = typeExercises.every((e) => manualSelected.has(e.id));
    setManualSelected((prev) => {
      const next = new Set(prev);
      typeExercises.forEach((e) => {
        if (allSelected) next.delete(e.id);
        else next.add(e.id);
      });
      return next;
    });
  };

  const buildManualPaper = () => {
    const selected = manualExercises.filter((e) => manualSelected.has(e.id));
    const result: PaperQuestion[] = selected.map((q) => ({
      id: q.id,
      type: q.exercise_type,
      question: q.question,
      options: q.options as string[] | undefined,
      correct_option: q.correct_option || undefined,
    }));
    setPaper(result);
    setStep("manual-review");
  };

  const movePaperQuestion = (index: number, direction: "up" | "down") => {
    setPaper((prev) => {
      const arr = [...prev];
      const targetIdx = direction === "up" ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= arr.length) return prev;
      [arr[index], arr[targetIdx]] = [arr[targetIdx], arr[index]];
      return arr;
    });
  };

  const removePaperQuestion = (index: number) => {
    const q = paper[index];
    setLockedIds((prev) => {
      const next = new Set(prev);
      next.delete(q.id);
      return next;
    });
    setPaper((prev) => prev.filter((_, i) => i !== index));
  };

  // Toggle lock on a question
  const toggleLock = (questionId: string) => {
    setLockedIds((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  const generatePaper = useCallback(async (exercises?: any[]) => {
    setGenerating(true);
    try {
      let data = exercises || allExercises;

      if (!exercises) {
        const { data: fetched, error } = await supabase
          .from("chapter_exercises")
          .select("*")
          .eq("class_id", classId)
          .eq("subject_id", subjectId)
          .in("chapter_number", selectedChapters);

        if (error) throw error;
        data = fetched || [];
        setAllExercises(data);
      }

      const result: PaperQuestion[] = [];
      for (const type of QUESTION_TYPES) {
        const count = config[type.key] || 0;
        if (count === 0) continue;

        const pool = data.filter((e: any) => e.exercise_type === type.key);
        const picked = shuffleArray(pool).slice(0, count);
        picked.forEach((q: any) => {
          result.push({
            id: q.id,
            type: type.key,
            question: q.question,
            options: q.options as string[] | undefined,
            correct_option: q.correct_option || undefined,
          });
        });
      }

      setPaper(result);
      setLockedIds(new Set());
      setStep("paper");
    } catch {
      toast.error("Failed to generate paper");
    } finally {
      setGenerating(false);
    }
  }, [allExercises, classId, subjectId, selectedChapters, config]);

  // Regenerate: keep locked questions, reshuffle unlocked slots
  const regeneratePaper = () => {
    const lockedQuestions = paper.filter((q) => lockedIds.has(q.id));
    const lockedIdSet = new Set(lockedQuestions.map((q) => q.id));

    const result: PaperQuestion[] = [];
    for (const type of QUESTION_TYPES) {
      const count = config[type.key] || 0;
      if (count === 0) continue;

      const lockedOfType = lockedQuestions.filter((q) => q.type === type.key);
      const neededCount = count - lockedOfType.length;

      // Pool excluding all locked questions
      const pool = allExercises.filter(
        (e: any) => e.exercise_type === type.key && !lockedIdSet.has(e.id)
      );
      const newPicked = shuffleArray(pool).slice(0, Math.max(0, neededCount));

      // Merge: locked first, then new picks
      lockedOfType.forEach((q) => result.push(q));
      newPicked.forEach((q: any) => {
        result.push({
          id: q.id,
          type: type.key,
          question: q.question,
          options: q.options as string[] | undefined,
          correct_option: q.correct_option || undefined,
        });
      });
    }

    setPaper(result);
    toast.success("Paper regenerated! Locked questions preserved.");
  };

  // Open replace view for a specific question
  const openReplace = (index: number) => {
    setReplaceIndex(index);
    setReplaceSearch("");
    setStep("replace");
  };

  // Get replacement candidates for the question being replaced
  const getReplaceCandidates = () => {
    if (replaceIndex === null) return [];
    const q = paper[replaceIndex];
    if (!q) return [];
    const currentPaperIds = new Set(paper.map((p) => p.id));
    // Show all questions of same type from selected chapters (including current one for context)
    const all = allExercises.filter((e: any) => e.exercise_type === q.type);
    // Filter by search
    const search = replaceSearch.toLowerCase().trim();
    if (search) {
      return all.filter((e: any) => e.question.toLowerCase().includes(search));
    }
    return all;
  };

  // Replace the question at replaceIndex with a new one
  const doReplace = (newExercise: any) => {
    if (replaceIndex === null) return;
    const oldQ = paper[replaceIndex];
    // Remove lock from old question if it was locked
    setLockedIds((prev) => {
      const next = new Set(prev);
      next.delete(oldQ.id);
      return next;
    });
    setPaper((prev) => {
      const arr = [...prev];
      arr[replaceIndex] = {
        id: newExercise.id,
        type: newExercise.exercise_type,
        question: newExercise.question,
        options: newExercise.options as string[] | undefined,
        correct_option: newExercise.correct_option || undefined,
      };
      return arr;
    });
    toast.success("Question replaced!");
    setReplaceIndex(null);
    setReplaceSearch("");
    setStep("paper");
  };

  const getTypeLabel = (key: string) => QUESTION_TYPES.find((t) => t.key === key)?.label || key;

  const groupedPaper = QUESTION_TYPES.reduce<Record<string, PaperQuestion[]>>((acc, type) => {
    const items = paper.filter((p) => p.type === type.key);
    if (items.length > 0) acc[type.key] = items;
    return acc;
  }, {});

  const buildPaperText = () => {
    let text = `${clsName} — ${subjectName}\nPaper\n${"─".repeat(40)}\n\n`;
    let globalQ = 1;
    if (step === "manual-review") {
      paper.forEach((q) => {
        text += `Q.${globalQ}  ${q.question}\n`;
        if (q.options && q.options.length > 0) {
          q.options.forEach((opt, i) => {
            text += `   (${String.fromCharCode(97 + i)}) ${opt}\n`;
          });
        }
        text += "\n";
        globalQ++;
      });
    } else {
      for (const typeKey of Object.keys(groupedPaper)) {
        text += `${getTypeLabel(typeKey)}\n\n`;
        groupedPaper[typeKey].forEach((q) => {
          text += `Q.${globalQ}  ${q.question}\n`;
          if (q.options && q.options.length > 0) {
            q.options.forEach((opt, i) => {
              text += `   (${String.fromCharCode(97 + i)}) ${opt}\n`;
            });
          }
          text += "\n";
          globalQ++;
        });
        text += "\n";
      }
    }
    return text;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildPaperText());
      setCopied(true);
      toast.success("Paper copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;
    const maxWidth = pageWidth - margin * 2;
    let y = 20;

    const checkPage = (needed: number) => {
      if (y + needed > pageHeight - 15) {
        doc.addPage();
        y = 20;
      }
    };

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`${clsName} — ${subjectName}`, margin, y);
    y += 8;
    doc.setFontSize(13);
    doc.text("Paper", margin, y);
    y += 6;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    let globalQ = 1;

    const renderQuestion = (q: PaperQuestion) => {
      checkPage(20);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      const qLines = doc.splitTextToSize(`Q.${globalQ}  ${q.question}`, maxWidth);
      doc.text(qLines, margin, y);
      y += qLines.length * 5.5 + 2;

      if (q.options && q.options.length > 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        q.options.forEach((opt, i) => {
          checkPage(6);
          doc.text(`   (${String.fromCharCode(97 + i)}) ${opt}`, margin + 4, y);
          y += 5;
        });
        y += 2;
      }
      y += 4;
      globalQ++;
    };

    if (step === "manual-review") {
      paper.forEach(renderQuestion);
    } else {
      for (const typeKey of Object.keys(groupedPaper)) {
        checkPage(20);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(getTypeLabel(typeKey), margin, y);
        y += 8;
        groupedPaper[typeKey].forEach(renderQuestion);
        y += 4;
      }
    }

    doc.save(`Paper_${subjectName.replace(/\s+/g, "_")}.pdf`);
    toast.success("PDF downloaded!");
  };

  const manualGrouped = QUESTION_TYPES.reduce<Record<string, any[]>>((acc, type) => {
    const items = manualExercises.filter((e) => e.exercise_type === type.key);
    if (items.length > 0) acc[type.key] = items;
    return acc;
  }, {});

  const handleChaptersNext = async () => {
    if (mode === "random") {
      await fetchAvailableTypes();
      setStep("config");
    } else {
      await fetchManualExercises();
      setStep("manual-browse");
    }
  };

  // For replace step
  const replaceCandidates = step === "replace" ? getReplaceCandidates() : [];
  const replaceQuestion = replaceIndex !== null ? paper[replaceIndex] : null;
  const currentPaperIds = new Set(paper.map((p) => p.id));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto sm:rounded-3xl">
        {/* Step: Mode Selection */}
        {step === "mode" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Make a Paper</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground mb-4">Choose how you want to create your paper.</p>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => { setMode("random"); setStep("chapters"); }}
                className="group flex items-center gap-4 p-5 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground shadow-md group-hover:scale-110 transition-transform">
                  <Shuffle className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-foreground">Random Paper</p>
                  <p className="text-xs text-muted-foreground">Auto-pick random questions from selected chapters</p>
                </div>
              </button>
              <button
                onClick={() => { setMode("manual"); setStep("chapters"); }}
                className="group flex items-center gap-4 p-5 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground shadow-md group-hover:scale-110 transition-transform">
                  <Hand className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-foreground">Manual Paper</p>
                  <p className="text-xs text-muted-foreground">Browse & hand-pick individual questions</p>
                </div>
              </button>
            </div>
          </>
        )}

        {/* Step: Chapter Selection */}
        {step === "chapters" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <button onClick={() => setStep("mode")} className="p-1 rounded-lg hover:bg-muted transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                Select Chapters
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground mb-4">
              Choose chapters to include in your {mode === "random" ? "random" : "manual"} paper.
            </p>
            {chaptersLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : !chapters || chapters.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">No chapters available.</p>
            ) : (
              <div className="space-y-2 mb-4">
                {chapters.map((ch) => (
                  <label
                    key={ch.chapter_number}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                      selectedChapters.includes(ch.chapter_number)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <Checkbox
                      checked={selectedChapters.includes(ch.chapter_number)}
                      onCheckedChange={() => toggleChapter(ch.chapter_number)}
                    />
                    <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                      {ch.chapter_number}
                    </span>
                    <span className="text-sm font-medium text-foreground">{ch.chapter_title}</span>
                  </label>
                ))}
              </div>
            )}
            <Button
              onClick={handleChaptersNext}
              disabled={selectedChapters.length === 0 || loadingTypes || manualLoading}
              className="w-full rounded-xl"
            >
              {(loadingTypes || manualLoading) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {mode === "random" ? "Next — Configure Questions" : "Next — Browse Questions"}
            </Button>
          </>
        )}

        {/* Step: Question Count Config (Random mode) */}
        {step === "config" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <button onClick={() => setStep("chapters")} className="p-1 rounded-lg hover:bg-muted transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                Configure Paper
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground mb-4">Set how many questions of each type you want.</p>
            <div className="space-y-3 mb-6">
              {QUESTION_TYPES.filter((type) => availableTypes.includes(type.key)).map((type) => (
                <div key={type.key} className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
                  <div>
                    <span className="text-sm font-medium text-foreground">{type.label}</span>
                    <span className="text-xs text-muted-foreground ml-2">({typeCounts[type.key] || 0} available)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setConfig((c) => ({ ...c, [type.key]: Math.max(0, (c[type.key] || 0) - 1) }))}
                      className="w-8 h-8 rounded-lg bg-muted text-foreground font-bold flex items-center justify-center hover:bg-muted/80 transition-colors"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-bold text-foreground">{config[type.key] || 0}</span>
                    <button
                      onClick={() => setConfig((c) => ({ ...c, [type.key]: Math.min((c[type.key] || 0) + 1, typeCounts[type.key] || 0) }))}
                      className="w-8 h-8 rounded-lg bg-muted text-foreground font-bold flex items-center justify-center hover:bg-muted/80 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={() => generatePaper()}
              disabled={generating || Object.values(config).every((v) => v === 0)}
              className="w-full rounded-xl gap-2"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Make Paper
            </Button>
          </>
        )}

        {/* Step: Manual Browse & Pick */}
        {step === "manual-browse" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <button onClick={() => setStep("chapters")} className="p-1 rounded-lg hover:bg-muted transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                Pick Questions
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Tap to select questions for your paper.
              </p>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                {manualSelected.size} selected
              </span>
            </div>

            {manualLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : Object.keys(manualGrouped).length === 0 ? (
              <p className="text-center text-muted-foreground py-10">No exercises found.</p>
            ) : (
              <div className="space-y-3 mb-4">
                {Object.keys(manualGrouped).map((typeKey) => {
                  const items = manualGrouped[typeKey];
                  const isExpanded = expandedType === typeKey;
                  const selectedCount = items.filter((e: any) => manualSelected.has(e.id)).length;
                  const allSelected = selectedCount === items.length;

                  return (
                    <div key={typeKey} className="rounded-xl border border-border overflow-hidden">
                      <button
                        onClick={() => setExpandedType(isExpanded ? null : typeKey)}
                        className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">{getTypeLabel(typeKey)}</span>
                          <span className="text-xs text-muted-foreground">({items.length})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedCount > 0 && (
                            <span className="text-xs font-medium text-primary">{selectedCount} picked</span>
                          )}
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      </button>

                      {isExpanded && (() => {
                        const searchTerm = (manualSearches[typeKey] || "").toLowerCase().trim();
                        const filteredItems = searchTerm
                          ? items.filter((ex: any) => ex.question.toLowerCase().includes(searchTerm))
                          : items;

                        return (
                          <div className="divide-y divide-border">
                            {/* Search bar for this section */}
                            <div className="p-2.5 px-3">
                              <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                <Input
                                  value={manualSearches[typeKey] || ""}
                                  onChange={(e) => setManualSearches((prev) => ({ ...prev, [typeKey]: e.target.value }))}
                                  placeholder={`Search ${getTypeLabel(typeKey).toLowerCase()}...`}
                                  className="pl-8 h-8 text-xs rounded-lg"
                                />
                              </div>
                            </div>
                            <label className="flex items-center gap-3 p-2.5 px-3 cursor-pointer hover:bg-muted/30 transition-colors">
                              <Checkbox
                                checked={allSelected}
                                onCheckedChange={() => toggleAllOfType(typeKey)}
                              />
                              <span className="text-xs font-semibold text-primary">
                                {allSelected ? "Deselect All" : "Select All"}
                              </span>
                              {searchTerm && (
                                <span className="text-[10px] text-muted-foreground ml-auto">
                                  {filteredItems.length} of {items.length} shown
                                </span>
                              )}
                            </label>
                            {filteredItems.length === 0 ? (
                              <p className="text-center text-xs text-muted-foreground py-4">No matching questions found.</p>
                            ) : (
                              filteredItems.map((ex: any) => (
                                <label
                                  key={ex.id}
                                  className={`flex items-start gap-3 p-2.5 px-3 cursor-pointer transition-colors ${
                                    manualSelected.has(ex.id) ? "bg-primary/5" : "hover:bg-muted/20"
                                  }`}
                                >
                                  <Checkbox
                                    checked={manualSelected.has(ex.id)}
                                    onCheckedChange={() => toggleManualQuestion(ex.id)}
                                    className="mt-0.5"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-foreground leading-relaxed">{ex.question}</p>
                                    {ex.options && (ex.options as string[]).length > 0 && (
                                      <div className="mt-1 space-y-0.5">
                                        {(ex.options as string[]).map((opt: string, oi: number) => (
                                          <p key={oi} className="text-xs text-muted-foreground">
                                            ({String.fromCharCode(97 + oi)}) {opt}
                                          </p>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </label>
                              ))
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            )}

            <Button
              onClick={buildManualPaper}
              disabled={manualSelected.size === 0}
              className="w-full rounded-xl gap-2"
            >
              <FileText className="w-4 h-4" />
              Review Paper ({manualSelected.size} questions)
            </Button>
          </>
        )}

        {/* Step: Manual Review & Reorder */}
        {step === "manual-review" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <button onClick={() => setStep("manual-browse")} className="p-1 rounded-lg hover:bg-muted transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                Review & Reorder
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground mb-4">
              Reorder or remove questions. {paper.length} question{paper.length !== 1 ? "s" : ""} in paper.
            </p>

            {paper.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <p>No questions in paper.</p>
                <Button variant="outline" onClick={() => setStep("manual-browse")} className="mt-3 rounded-xl">
                  Go back & pick questions
                </Button>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {paper.map((q, i) => (
                  <div key={q.id + i} className="flex items-start gap-2 p-3 rounded-xl border border-border bg-card group">
                    <div className="flex flex-col gap-0.5 shrink-0 mt-0.5">
                      <button
                        onClick={() => movePaperQuestion(i, "up")}
                        disabled={i === 0}
                        className="w-6 h-6 rounded-md bg-muted flex items-center justify-center hover:bg-primary/10 disabled:opacity-30 transition-colors"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => movePaperQuestion(i, "down")}
                        disabled={i === paper.length - 1}
                        className="w-6 h-6 rounded-md bg-muted flex items-center justify-center hover:bg-primary/10 disabled:opacity-30 transition-colors"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-primary/60 mb-0.5">{getTypeLabel(q.type)}</p>
                      <p className="text-sm text-foreground leading-relaxed">
                        <span className="text-primary/70 font-bold mr-1">Q.{i + 1}</span>
                        {q.question}
                      </p>
                      {q.options && q.options.length > 0 && (
                        <div className="ml-6 mt-1 space-y-0.5">
                          {q.options.map((opt, oi) => (
                            <p key={oi} className="text-xs text-muted-foreground">
                              ({String.fromCharCode(97 + oi)}) {opt}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removePaperQuestion(i)}
                      className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {paper.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button onClick={handleCopy} variant="outline" className="flex-1 rounded-xl gap-2">
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button onClick={handleDownloadPdf} variant="outline" className="flex-1 rounded-xl gap-2">
                    <Download className="w-4 h-4" />
                    Download PDF
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Step: Generated Paper (Random mode) — with Lock & Replace */}
        {step === "paper" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Your Paper</DialogTitle>
            </DialogHeader>

            {paper.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <p>No questions found for selected criteria.</p>
                <p className="text-xs mt-1">Try selecting different chapters or adjusting counts.</p>
              </div>
            ) : (
              <>
                {/* Lock/Replace legend */}
                <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Lock = keep on regenerate</span>
                  <span className="flex items-center gap-1"><Replace className="w-3 h-3" /> Replace = swap question</span>
                </div>

                <div className="space-y-6 mb-4">
                  {Object.keys(groupedPaper).map((typeKey) => {
                    const items = groupedPaper[typeKey];
                    let startIdx = 0;
                    for (const tk of Object.keys(groupedPaper)) {
                      if (tk === typeKey) break;
                      startIdx += groupedPaper[tk].length;
                    }

                    return (
                      <div key={typeKey}>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-primary/80 mb-3 border-b border-border pb-2">
                          {getTypeLabel(typeKey)}
                        </h3>
                        <div className="space-y-2">
                          {items.map((q, i) => {
                            const globalIdx = paper.findIndex((p) => p.id === q.id);
                            const isLocked = lockedIds.has(q.id);

                            return (
                              <div
                                key={q.id}
                                className={`group relative p-3 rounded-xl border transition-all duration-200 ${
                                  isLocked
                                    ? "border-primary/40 bg-primary/5"
                                    : "border-border bg-card hover:border-border"
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-foreground leading-relaxed">
                                      <span className="text-primary/70 mr-1.5">Q.{startIdx + i + 1}</span>
                                      {q.question}
                                    </p>
                                    {q.options && q.options.length > 0 && (
                                      <div className="ml-8 mt-1 space-y-0.5">
                                        {q.options.map((opt, oi) => (
                                          <p key={oi} className="text-muted-foreground text-xs">
                                            ({String.fromCharCode(97 + oi)}) {opt}
                                          </p>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  {/* Lock & Replace buttons */}
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      onClick={() => toggleLock(q.id)}
                                      title={isLocked ? "Unlock question" : "Lock question"}
                                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                                        isLocked
                                          ? "bg-primary text-primary-foreground shadow-sm"
                                          : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                                      }`}
                                    >
                                      {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                                    </button>
                                    <button
                                      onClick={() => openReplace(globalIdx)}
                                      title="Replace question"
                                      className="w-8 h-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                                    >
                                      <Replace className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Actions */}
            {paper.length > 0 && (
              <div className="flex flex-col gap-2">
                {lockedIds.size > 0 && (
                  <p className="text-xs text-center text-primary font-medium">
                    🔒 {lockedIds.size} question{lockedIds.size !== 1 ? "s" : ""} locked — will be preserved on regenerate
                  </p>
                )}
                <div className="flex gap-2">
                  <Button onClick={handleCopy} variant="outline" className="flex-1 rounded-xl gap-2">
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button onClick={handleDownloadPdf} variant="outline" className="flex-1 rounded-xl gap-2">
                    <Download className="w-4 h-4" />
                    Download PDF
                  </Button>
                </div>
                <Button onClick={regeneratePaper} className="w-full rounded-xl gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Create Another Paper
                </Button>
              </div>
            )}
          </>
        )}

        {/* Step: Replace Question */}
        {step === "replace" && replaceQuestion && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <button onClick={() => { setStep("paper"); setReplaceIndex(null); setReplaceSearch(""); }} className="p-1 rounded-lg hover:bg-muted transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                Replace Question
              </DialogTitle>
            </DialogHeader>

            {/* Current question being replaced */}
            <div className="p-3 rounded-xl border border-destructive/30 bg-destructive/5 mb-4">
              <p className="text-xs font-semibold text-destructive/70 mb-1">Replacing:</p>
              <p className="text-sm text-foreground">{replaceQuestion.question}</p>
            </div>

            {/* Section label + count */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-foreground">
                {getTypeLabel(replaceQuestion.type)}
              </p>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                {replaceCandidates.length} available
              </span>
            </div>

            {/* Search bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={replaceSearch}
                onChange={(e) => setReplaceSearch(e.target.value)}
                placeholder="Search questions..."
                className="pl-9 rounded-xl"
              />
            </div>

            {/* Questions list */}
            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {replaceCandidates.length === 0 ? (
                <p className="text-center text-muted-foreground py-6 text-sm">No questions found.</p>
              ) : (
                replaceCandidates.map((ex: any, idx: number) => {
                  const isInPaper = currentPaperIds.has(ex.id);
                  const isCurrent = ex.id === replaceQuestion.id;

                  return (
                    <button
                      key={ex.id}
                      onClick={() => !isCurrent && doReplace(ex)}
                      disabled={isCurrent}
                      className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                        isCurrent
                          ? "border-primary/40 bg-primary/5 opacity-60 cursor-not-allowed"
                          : isInPaper
                          ? "border-border bg-muted/30 hover:border-primary/30 hover:bg-primary/5"
                          : "border-border bg-card hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-bold text-primary/60 mt-0.5 shrink-0">
                          {idx + 1}.
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground leading-relaxed">{ex.question}</p>
                          {ex.options && (ex.options as string[]).length > 0 && (
                            <div className="mt-1 space-y-0.5">
                              {(ex.options as string[]).map((opt: string, oi: number) => (
                                <p key={oi} className="text-xs text-muted-foreground">
                                  ({String.fromCharCode(97 + oi)}) {opt}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                            Current
                          </span>
                        )}
                        {isInPaper && !isCurrent && (
                          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
                            In Paper
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MakeAPaper;
