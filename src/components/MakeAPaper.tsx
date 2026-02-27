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
import { Loader2, Shuffle, FileText, Copy, Check, Download, RefreshCw, ArrowLeft } from "lucide-react";
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

type Step = "mode" | "chapters" | "config" | "paper";

const QUESTION_TYPES = [
  { key: "long_question_answers", label: "Long Questions" },
  { key: "short_question_answers", label: "Short Questions" },
  { key: "fill_in_the_blanks", label: "Fill in the Blanks" },
  { key: "match_columns", label: "Match the Columns" },
  { key: "true_false", label: "True / False" },
  { key: "choose_correct_answer", label: "MCQs" },
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
  const [selectedChapters, setSelectedChapters] = useState<number[]>([]);
  const [config, setConfig] = useState<Record<string, number>>({});
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [paper, setPaper] = useState<{ type: string; question: string; options?: string[]; correct_option?: string }[]>([]);
  const [allExercises, setAllExercises] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

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
    setSelectedChapters([]);
    setPaper([]);
    setAllExercises([]);
    setConfig({});
    setAvailableTypes([]);
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
      const types = [...new Set((data || []).map((d: any) => d.exercise_type))];
      setAvailableTypes(types);
      // Set default counts only for available types
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

  const handleClose = (val: boolean) => {
    if (!val) resetState();
    onOpenChange(val);
  };

  const toggleChapter = (num: number) => {
    setSelectedChapters((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  const generatePaper = useCallback(async (exercises?: any[]) => {
    setGenerating(true);
    try {
      let data = exercises || allExercises;

      if (!exercises) {
        // Fetch all exercises for selected chapters
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

      // Group by type and pick random
      const result: typeof paper = [];
      for (const type of QUESTION_TYPES) {
        const count = config[type.key] || 0;
        if (count === 0) continue;

        const pool = data.filter((e: any) => e.exercise_type === type.key);
        const picked = shuffleArray(pool).slice(0, count);
        picked.forEach((q: any) => {
          result.push({
            type: type.key,
            question: q.question,
            options: q.options as string[] | undefined,
            correct_option: q.correct_option || undefined,
          });
        });
      }

      setPaper(result);
      setStep("paper");
    } catch {
      toast.error("Failed to generate paper");
    } finally {
      setGenerating(false);
    }
  }, [allExercises, classId, subjectId, selectedChapters, config]);

  const regeneratePaper = () => {
    generatePaper(allExercises);
  };

  const getTypeLabel = (key: string) => QUESTION_TYPES.find((t) => t.key === key)?.label || key;

  // Group paper by type for display
  const groupedPaper = QUESTION_TYPES.reduce<Record<string, typeof paper>>((acc, type) => {
    const items = paper.filter((p) => p.type === type.key);
    if (items.length > 0) acc[type.key] = items;
    return acc;
  }, {});

  const buildPaperText = () => {
    let text = `${clsName} — ${subjectName}\nPaper\n${"─".repeat(40)}\n\n`;
    let globalQ = 1;
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
    for (const typeKey of Object.keys(groupedPaper)) {
      checkPage(20);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(getTypeLabel(typeKey), margin, y);
      y += 8;

      groupedPaper[typeKey].forEach((q) => {
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
      });

      y += 4;
    }

    doc.save(`Paper_${subjectName.replace(/\s+/g, "_")}.pdf`);
    toast.success("PDF downloaded!");
  };

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
                onClick={() => setStep("chapters")}
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
                disabled
                className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card opacity-50 cursor-not-allowed"
              >
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-foreground">Manual</p>
                  <p className="text-xs text-muted-foreground">Coming soon</p>
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
            <p className="text-sm text-muted-foreground mb-4">Choose chapters to include in your paper.</p>
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
              onClick={() => setStep("config")}
              disabled={selectedChapters.length === 0}
              className="w-full rounded-xl"
            >
              Next — Configure Questions
            </Button>
          </>
        )}

        {/* Step: Question Count Config */}
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
              {QUESTION_TYPES.map((type) => (
                <div key={type.key} className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
                  <span className="text-sm font-medium text-foreground">{type.label}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setConfig((c) => ({ ...c, [type.key]: Math.max(0, (c[type.key] || 0) - 1) }))}
                      className="w-8 h-8 rounded-lg bg-muted text-foreground font-bold flex items-center justify-center hover:bg-muted/80 transition-colors"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-bold text-foreground">{config[type.key] || 0}</span>
                    <button
                      onClick={() => setConfig((c) => ({ ...c, [type.key]: (c[type.key] || 0) + 1 }))}
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

        {/* Step: Generated Paper */}
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
              <div className="space-y-6 mb-4">
                {Object.keys(groupedPaper).map((typeKey) => {
                  const items = groupedPaper[typeKey];
                  let startIdx = 0;
                  // Calculate starting index
                  for (const tk of Object.keys(groupedPaper)) {
                    if (tk === typeKey) break;
                    startIdx += groupedPaper[tk].length;
                  }

                  return (
                    <div key={typeKey}>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-primary/80 mb-3 border-b border-border pb-2">
                        {getTypeLabel(typeKey)}
                      </h3>
                      <div className="space-y-3">
                        {items.map((q, i) => (
                          <div key={i} className="text-sm">
                            <p className="font-semibold text-foreground leading-relaxed">
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
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Actions */}
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
              <Button onClick={regeneratePaper} className="w-full rounded-xl gap-2">
                <RefreshCw className="w-4 h-4" />
                Create Another Paper
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MakeAPaper;
