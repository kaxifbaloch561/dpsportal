import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { useClassesData } from "@/hooks/useClassesData";
import { supabase } from "@/integrations/supabase/client";
import PageShell from "@/components/PageShell";
import DashboardHeader from "@/components/DashboardHeader";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import {
  Loader2, Copy, Check, Download, BookOpen,
  PenLine, CheckCircle2, Columns3, ToggleLeft,
  FileText, MessageSquareText
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

const EXERCISE_TYPE_LABELS: Record<string, string> = {
  fill_in_the_blanks: "Fill in the Blanks",
  choose_correct_answer: "Choose the Correct Answer",
  match_columns: "Match the Columns",
  true_false: "True and False",
  long_question_answers: "Long Question Answers",
  short_question_answers: "Short Question Answers",
};

const TYPE_ICONS: Record<string, any> = {
  fill_in_the_blanks: PenLine,
  choose_correct_answer: CheckCircle2,
  match_columns: Columns3,
  true_false: ToggleLeft,
  long_question_answers: FileText,
  short_question_answers: MessageSquareText,
};

const TYPE_GRADIENTS: Record<string, string> = {
  fill_in_the_blanks: "from-blue-500 to-cyan-500",
  choose_correct_answer: "from-emerald-500 to-teal-500",
  match_columns: "from-violet-500 to-purple-500",
  true_false: "from-amber-500 to-orange-500",
  long_question_answers: "from-rose-500 to-pink-500",
  short_question_answers: "from-indigo-500 to-blue-500",
};

/** Generate and download a PDF of exercises */
const handleDownloadPdf = (
  exercises: any[],
  typeLabel: string,
  className: string,
  subjectName: string,
  chapNum: number
) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  const checkPage = (needed: number) => {
    if (y + needed > doc.internal.pageSize.getHeight() - 15) {
      doc.addPage();
      y = 20;
    }
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(`${className} — ${subjectName}`, margin, y);
  y += 8;
  doc.setFontSize(13);
  doc.text(`Chapter ${chapNum} — ${typeLabel}`, margin, y);
  y += 12;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  exercises.forEach((item, idx) => {
    checkPage(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    const qLines = doc.splitTextToSize(`Q.${idx + 1}  ${item.question}`, maxWidth);
    doc.text(qLines, margin, y);
    y += qLines.length * 5.5 + 3;

    const ansText = item.answer || item.correct_option || "";
    if (ansText) {
      checkPage(15);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text("Ans:", margin + 2, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      const aLines = doc.splitTextToSize(ansText, maxWidth - 4);
      aLines.forEach((line: string) => {
        checkPage(6);
        doc.text(line, margin + 2, y);
        y += 5;
      });
      y += 2;
    }

    doc.setTextColor(0, 0, 0);
    y += 4;
    if (idx < exercises.length - 1) {
      doc.setDrawColor(230, 230, 230);
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;
    }
  });

  const fileName = `Ch${chapNum}_${typeLabel.replace(/\s+/g, "_")}.pdf`;
  doc.save(fileName);
  toast.success("PDF downloaded!");
};

const ExerciseDetailPage = () => {
  const { classId, subjectId, chapterNumber, exerciseType } = useParams();
  const { data: classesData = [] } = useClassesData();
  const cls = classesData.find((c) => c.id === Number(classId));
  const subject = cls?.subjects.find((s) => s.id === subjectId);
  const chapNum = Number(chapterNumber);
  const typeLabel = EXERCISE_TYPE_LABELS[exerciseType || ""] || exerciseType;
  const TypeIcon = TYPE_ICONS[exerciseType || ""] || BookOpen;
  const typeGradient = TYPE_GRADIENTS[exerciseType || ""] || "from-primary to-accent";

  const { data: exercises, isLoading } = useQuery({
    queryKey: ["exercises", classId, subjectId, chapterNumber, exerciseType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapter_exercises")
        .select("*")
        .eq("class_id", Number(classId))
        .eq("subject_id", subjectId || "")
        .eq("chapter_number", chapNum)
        .eq("exercise_type", exerciseType || "")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!classId && !!subjectId && !!chapterNumber && !!exerciseType,
  });

  if (!cls || !subject) return <div className="p-10 text-center">Not found</div>;

  return (
    <PageShell>
      <DashboardHeader showBack subtitle={`${cls.name} — ${subject.name} — Ch ${chapNum} — ${typeLabel}`} />
      <BreadcrumbNav crumbs={[
        { label: "Dashboard", path: "/dashboard" },
        { label: cls.name, path: `/class/${cls.id}` },
        { label: subject.name, path: `/class/${cls.id}/subject/${subject.id}` },
        { label: "Chapters", path: `/class/${cls.id}/subject/${subject.id}/chapters` },
        { label: `Ch ${chapNum} Exercise`, path: `/class/${classId}/subject/${subjectId}/chapter/${chapterNumber}/exercise` },
        { label: typeLabel },
      ]} />

      <div className="flex-1 px-3 sm:px-8 pb-6 sm:pb-8 overflow-y-auto">
        {/* Hero Header */}
        <div
          className="mt-3 sm:mt-4 mb-5 sm:mb-8"
          style={{ animation: "slideUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards", opacity: 0 }}
        >
          <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${typeGradient} text-white shadow-lg`}>
                <TypeIcon className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-extrabold text-foreground tracking-tight">
                  {typeLabel}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Chapter {chapNum} • {exercises?.length || 0} Questions
                </p>
              </div>
            </div>

            {exercises && exercises.length > 0 && (
              <button
                onClick={() => handleDownloadPdf(exercises, typeLabel, cls?.name || "", subject?.name || "", chapNum)}
                className="flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs sm:text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">PDF</span>
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !exercises || exercises.length === 0 ? (
          <div className="text-center text-muted-foreground py-20 bg-card/50 rounded-2xl border border-border/40">
            No exercises available.
          </div>
        ) : (
          <div className="max-w-3xl space-y-3 sm:space-y-5">
            {exercises.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  animation: `slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards ${0.05 * idx + 0.15}s`,
                  opacity: 0,
                }}
              >
                <ExerciseCard item={item} index={idx + 1} exerciseType={exerciseType || ""} typeGradient={typeGradient} />
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
};

// ─── Sub-components ──────────────────────────────────────────────

interface ExerciseItem {
  id: string;
  question: string;
  answer: string | null;
  options: any;
  correct_option: string | null;
  exercise_type: string;
}

const ExerciseCard = ({
  item, index, exerciseType, typeGradient,
}: {
  item: ExerciseItem; index: number; exerciseType: string; typeGradient: string;
}) => {
  const isMCQ = exerciseType === "choose_correct_answer" || exerciseType === "true_false";
  const isLongAnswer = exerciseType === "long_question_answers";
  const isShortAnswer = exerciseType === "short_question_answers";
  const options = (item.options as string[]) || [];
  const copyText = `Q.${index} ${item.question}\n\nAns: ${item.answer || item.correct_option || ""}`;

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border/60 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Question Header */}
      <div className="px-3.5 sm:px-7 pt-4 sm:pt-5 pb-3 sm:pb-4">
        <div className="flex gap-2.5 sm:gap-3.5 items-start">
          <span className={`flex-shrink-0 inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br ${typeGradient} text-white text-xs sm:text-sm font-black shadow-lg mt-0.5`}>
            {index}
          </span>
          <p className="flex-1 font-bold text-foreground text-[0.875rem] sm:text-[1rem] leading-[1.65] sm:leading-[1.75] pt-0.5 sm:pt-1">
            {item.question}
          </p>
          <CopyButton text={copyText} />
        </div>
      </div>

      {/* MCQ Options */}
      {isMCQ && options.length > 0 && (
        <div className="px-3.5 sm:px-7 pb-3 sm:pb-4">
          <div className="ml-[42px] sm:ml-[52px] space-y-1.5 sm:space-y-2">
            {options.map((opt: string, i: number) => {
              const letter = String.fromCharCode(97 + i);
              const isCorrect = item.correct_option &&
                (item.correct_option.toLowerCase() === letter ||
                 item.correct_option.toLowerCase() === String.fromCharCode(65 + i) ||
                 item.correct_option === opt);

              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
                    isCorrect
                      ? "border-emerald-500/30 bg-emerald-500/[0.06]"
                      : "border-border/40 bg-muted/20"
                  }`}
                >
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold shrink-0 ${
                    isCorrect
                      ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/25"
                      : "bg-muted/50 text-muted-foreground border border-border/40"
                  }`}>
                    {letter}
                  </span>
                  <span className={`text-sm leading-relaxed ${isCorrect ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {opt}
                  </span>
                  {isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Answer Section */}
      {item.answer && (
        <div className="mx-3.5 sm:mx-7 mb-4 sm:mb-5 ml-[42px] sm:ml-[68px]">
          <div className="pt-4 border-t border-border/40">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 rounded-full bg-gradient-to-b from-primary to-accent" />
              <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-primary/80">
                {isLongAnswer || isShortAnswer ? "Answer" : "Ans"}
              </p>
            </div>
            <div className={isLongAnswer || isShortAnswer ? "text-[0.9rem]" : ""}>
              <FormattedAnswer text={item.answer} />
            </div>
          </div>
        </div>
      )}

      {/* MCQ Correct Answer fallback */}
      {isMCQ && item.correct_option && !item.answer && (
        <div className="mx-5 sm:mx-7 mb-5 ml-[52px] sm:ml-[68px]">
          <div className="pt-4 border-t border-border/40">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600" />
              <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-emerald-600/80">
                Correct Answer
              </p>
            </div>
            <p className="text-sm text-foreground font-semibold">
              {item.correct_option.length === 1
                ? `(${item.correct_option.toLowerCase()}) ${options[item.correct_option.charCodeAt(0) - 65] || item.correct_option}`
                : item.correct_option}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

/** Renders answer text with headings, bold, structured bullets */
const FormattedAnswer = ({ text }: { text: string }) => {
  const sections = text.split(/\n\n+/);
  if (sections.length <= 1) return <>{renderStructuredText(text)}</>;
  return (
    <div className="space-y-4">
      {sections.map((section, i) => (
        <div key={i}>{renderStructuredText(section.trim())}</div>
      ))}
    </div>
  );
};

function renderStructuredText(text: string) {
  const sectionHeaderMatch = text.match(/^(\([a-z]\)\s*)?([A-Z][A-Za-z\s]+):\s*/);
  const numberedPattern = /\s+(?=\d+[-–]\s)/;
  const romanPattern = /\s+(?=(?:i{1,3}|iv|vi{0,3}|ix|x)\.\s)/i;

  let heading: string | null = null;
  let body = text;

  if (sectionHeaderMatch) {
    heading = sectionHeaderMatch[0].replace(/:?\s*$/, '');
    body = text.slice(sectionHeaderMatch[0].length);
  }

  let points = body.split(numberedPattern).filter(Boolean);
  if (points.length <= 1) points = body.split(romanPattern).filter(Boolean);

  if (points.length <= 1) {
    return (
      <div>
        {heading && <h4 className="font-bold text-foreground text-[0.95rem] mb-2">{heading}</h4>}
        <p className="text-muted-foreground leading-[1.95] text-[0.875rem]">{renderBoldText(body.trim())}</p>
      </div>
    );
  }

  return (
    <div>
      {heading && <h4 className="font-bold text-foreground text-[0.95rem] mb-2.5">{heading}</h4>}
      <div className="space-y-2.5">
        {points.map((point, i) => (
          <div key={i} className="flex gap-3 text-[0.875rem] leading-[1.95] text-muted-foreground">
            <span className="flex-shrink-0 mt-[0.55em] w-1.5 h-1.5 rounded-full bg-gradient-to-br from-primary to-accent" />
            <span>{renderBoldText(point.trim())}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderBoldText(text: string): React.ReactNode {
  const boldPattern = /\*\*(.*?)\*\*/g;
  if (boldPattern.test(text)) {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return (
      <>
        {parts.map((part, i) =>
          i % 2 === 1 ? (
            <strong key={i} className="font-semibold text-foreground">{part}</strong>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  }

  const colonMatch = text.match(/^([ivx]+\.\s*)?([A-Z][A-Za-z\s\-&'']+):\s*/i);
  if (colonMatch) {
    const prefix = colonMatch[0];
    const rest = text.slice(prefix.length);
    return (
      <>
        <strong className="font-semibold text-foreground">{prefix.trim()}</strong>{" "}{rest}
      </>
    );
  }

  return text;
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex-shrink-0 p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
      title="Copy question & answer"
    >
      {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
    </button>
  );
};

export default ExerciseDetailPage;
