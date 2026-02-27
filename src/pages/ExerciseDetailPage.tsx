import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { classesData } from "@/data/classesData";
import { supabase } from "@/integrations/supabase/client";
import PageShell from "@/components/PageShell";
import DashboardHeader from "@/components/DashboardHeader";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { Loader2, Copy, Check, Download } from "lucide-react";
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

const ExerciseDetailPage = () => {
  const { classId, subjectId, chapterNumber, exerciseType } = useParams();
  const cls = classesData.find((c) => c.id === Number(classId));
  const subject = cls?.subjects.find((s) => s.id === subjectId);
  const chapNum = Number(chapterNumber);
  const typeLabel = EXERCISE_TYPE_LABELS[exerciseType || ""] || exerciseType;

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

      <div className="flex-1 px-4 sm:px-8 pb-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-6 mt-4">
          <h2
            className="text-2xl font-bold text-foreground"
            style={{
              animation: "slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.3s",
              opacity: 0,
            }}
          >
            {typeLabel}
          </h2>
          {exercises && exercises.length > 0 && (
            <button
              onClick={() => handleDownloadPdf(exercises, typeLabel, cls?.name || "", subject?.name || "", chapNum)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md"
              style={{
                animation: "slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.4s",
                opacity: 0,
              }}
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !exercises || exercises.length === 0 ? (
          <div className="text-center text-muted-foreground py-20">
            No exercises available.
          </div>
        ) : (
          <div
            className="max-w-3xl space-y-5"
            style={{
              animation: "slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.5s",
              opacity: 0,
            }}
          >
            {exercises.map((item, idx) => (
              <ExerciseCard key={item.id} item={item} index={idx + 1} exerciseType={exerciseType || ""} />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
};

interface ExerciseItem {
  id: string;
  question: string;
  answer: string | null;
  options: any;
  correct_option: string | null;
  exercise_type: string;
}

/** Renders answer text with proper headings, bold text, and structured bullet points */
const FormattedAnswer = ({ text }: { text: string }) => {
  // Split into paragraphs by double-newline or by section headers like (a), (b)
  const sections = text.split(/\n\n+/);

  // If single block, parse inline structure
  if (sections.length <= 1) {
    return <>{renderStructuredText(text)}</>;
  }

  return (
    <div className="space-y-4">
      {sections.map((section, i) => (
        <div key={i}>{renderStructuredText(section.trim())}</div>
      ))}
    </div>
  );
};

/** Parse a text block and render with headings, bold, and bullet points */
function renderStructuredText(text: string) {
  // Check for section headers like "(a) Agricultural Reforms:" or "Achievements:" or "Challenges:"
  const sectionHeaderMatch = text.match(/^(\([a-z]\)\s*)?([A-Z][A-Za-z\s]+):\s*/);

  // Try to split by numbered points like "1-", "2-", "i.", "ii." etc.
  const numberedPattern = /\s+(?=\d+[-–]\s)/;
  const romanPattern = /\s+(?=(?:i{1,3}|iv|vi{0,3}|ix|x)\.\s)/i;

  let heading: string | null = null;
  let body = text;

  if (sectionHeaderMatch) {
    heading = sectionHeaderMatch[0].replace(/:?\s*$/, '');
    body = text.slice(sectionHeaderMatch[0].length);
  }

  // Try splitting by numbered items (1-, 2-, etc.)
  let points = body.split(numberedPattern).filter(Boolean);

  // If no numbered split, try roman numerals
  if (points.length <= 1) {
    points = body.split(romanPattern).filter(Boolean);
  }

  // If no structured points found, render as paragraph
  if (points.length <= 1) {
    return (
      <div>
        {heading && (
          <h4 className="font-bold text-foreground text-[0.95rem] mb-2">{heading}</h4>
        )}
        <p className="text-foreground/85 leading-[1.85] text-[0.925rem]">
          {renderBoldText(body.trim())}
        </p>
      </div>
    );
  }

  return (
    <div>
      {heading && (
        <h4 className="font-bold text-foreground text-[0.95rem] mb-2.5">{heading}</h4>
      )}
      <div className="space-y-2">
        {points.map((point, i) => (
          <div
            key={i}
            className="flex gap-2.5 text-[0.925rem] leading-[1.85] text-foreground/85"
          >
            <span className="flex-shrink-0 mt-[0.45em] w-1.5 h-1.5 rounded-full bg-primary/40" />
            <span>{renderBoldText(point.trim())}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Render text with **bold** markers or detect key phrases to bold */
function renderBoldText(text: string): React.ReactNode {
  // Handle explicit bold markers **text**
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

  // Auto-bold key terms before colons in list items, e.g. "Written Constitution: The..."
  const colonMatch = text.match(/^([ivx]+\.\s*)?([A-Z][A-Za-z\s\-&'']+):\s*/i);
  if (colonMatch) {
    const prefix = colonMatch[0];
    const rest = text.slice(prefix.length);
    return (
      <>
        <strong className="font-semibold text-foreground">{prefix.trim()}</strong>{" "}
        {rest}
      </>
    );
  }

  return text;
}

/** Copy button component */
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
      className="flex-shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
      title="Copy question & answer"
    >
      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
    </button>
  );
};

const ExerciseCard = ({ item, index, exerciseType }: { item: ExerciseItem; index: number; exerciseType: string }) => {
  const isMCQ = exerciseType === "choose_correct_answer" || exerciseType === "true_false";
  const isLongAnswer = exerciseType === "long_question_answers";
  const isShortAnswer = exerciseType === "short_question_answers";
  const options = (item.options as string[]) || [];

  // Build full copyable text
  const copyText = `Q.${index} ${item.question}\n\nAns: ${item.answer || item.correct_option || ""}`;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-7">
      {/* Question + Copy */}
      <div className="flex gap-3 items-start">
        <span className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-bold mt-0.5">
          Q.{index}
        </span>
        <p className="flex-1 font-semibold text-foreground text-[1.05rem] leading-relaxed pt-0.5">
          {item.question}
        </p>
        <CopyButton text={copyText} />
      </div>

      {/* MCQ Options */}
      {isMCQ && options.length > 0 && (
        <div className="ml-11 space-y-1.5 mt-3 mb-4">
          {options.map((opt: string, i: number) => {
            const letter = String.fromCharCode(65 + i);
            return (
              <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground/70">({letter.toLowerCase()})</span> {opt}
              </p>
            );
          })}
        </div>
      )}

      {/* Answer Section */}
      {item.answer && (
        <div className="ml-11 mt-4 pt-4 border-t border-border/60">
          <p className="text-xs font-bold uppercase tracking-widest text-primary/80 mb-3">
            {isLongAnswer || isShortAnswer ? "Answer" : "Ans"}
          </p>
          <div className={isLongAnswer || isShortAnswer ? "text-[0.925rem]" : ""}>
            <FormattedAnswer text={item.answer} />
          </div>
        </div>
      )}

      {/* MCQ Correct Answer */}
      {isMCQ && item.correct_option && !item.answer && (
        <div className="ml-11 mt-4 pt-4 border-t border-border/60">
          <p className="text-xs font-bold uppercase tracking-widest text-primary/80 mb-1.5">
            Correct Answer
          </p>
          <p className="text-sm text-foreground font-medium">
            {item.correct_option.length === 1
              ? `(${item.correct_option.toLowerCase()}) ${options[item.correct_option.charCodeAt(0) - 65] || item.correct_option}`
              : item.correct_option}
          </p>
        </div>
      )}
    </div>
  );
};

export default ExerciseDetailPage;
