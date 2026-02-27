import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { classesData } from "@/data/classesData";
import { supabase } from "@/integrations/supabase/client";
import PageShell from "@/components/PageShell";
import DashboardHeader from "@/components/DashboardHeader";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { Loader2 } from "lucide-react";

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
        <h2
          className="text-2xl font-bold text-foreground mb-6 mt-4"
          style={{
            animation: "slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.3s",
            opacity: 0,
          }}
        >
          {typeLabel}
        </h2>

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

/** Renders answer text with proper formatting: detects numbered points, Roman numerals, and paragraphs */
const FormattedAnswer = ({ text }: { text: string }) => {
  // Split by common delimiters for structured answers
  // Detect patterns like "i.", "ii.", "1-", "2-", "(a)", etc.
  const lines = text.split(/(?<=\.)\s+(?=(?:[ivxlcdm]+\.|[0-9]+[-.)]\s|\([a-z]\)))/i);
  
  // If no structured splitting found, try splitting by sentence-ending patterns followed by numbered items
  const segments = lines.length <= 1 
    ? text.split(/\s*(?=\d+[-–]\s)/) 
    : lines;

  // If still single block, render as clean paragraphs split by double-space or period patterns
  if (segments.length <= 1) {
    // Try splitting by (a), (b) style headers
    const headerSplit = text.split(/\s*(?=\([a-z]\)\s)/i);
    if (headerSplit.length > 1) {
      return (
        <div className="space-y-3">
          {headerSplit.map((seg, i) => {
            const headerMatch = seg.match(/^\(([a-z])\)\s*(.*)/i);
            if (headerMatch) {
              const [, , rest] = headerMatch;
              // Further split sub-content by roman numerals
              const subPoints = rest.split(/\s*(?=[ivx]+\.\s)/i).filter(Boolean);
              return (
                <div key={i}>
                  <p className="font-semibold text-foreground mb-2">{seg.match(/^\([a-z]\)\s*[^:]+:/i)?.[0] || seg.substring(0, seg.indexOf(':') + 1) || seg.substring(0, 60)}</p>
                  {subPoints.length > 1 ? (
                    <div className="space-y-1.5">
                      {subPoints.map((point, j) => (
                        <p key={j} className="text-foreground/90 leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-[0.6em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-primary/30">
                          {point.trim()}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-foreground/90 leading-relaxed">{rest.trim()}</p>
                  )}
                </div>
              );
            }
            return <p key={i} className="text-foreground/90 leading-relaxed">{seg.trim()}</p>;
          })}
        </div>
      );
    }

    // Plain paragraph
    return <p className="text-foreground/90 leading-[1.8] text-[0.935rem]">{text}</p>;
  }

  return (
    <div className="space-y-2">
      {segments.map((seg, i) => (
        <p key={i} className="text-foreground/90 leading-[1.8] text-[0.935rem] pl-4 relative before:content-[''] before:absolute before:left-0 before:top-[0.65em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-primary/30">
          {seg.trim()}
        </p>
      ))}
    </div>
  );
};

const ExerciseCard = ({ item, index, exerciseType }: { item: ExerciseItem; index: number; exerciseType: string }) => {
  const isMCQ = exerciseType === "choose_correct_answer" || exerciseType === "true_false";
  const isLongAnswer = exerciseType === "long_question_answers";
  const isShortAnswer = exerciseType === "short_question_answers";
  const options = (item.options as string[]) || [];

  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-7">
      {/* Question */}
      <div className="flex gap-3 mb-4">
        <span className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-bold mt-0.5">
          Q.{index}
        </span>
        <p className="font-semibold text-foreground text-[1.05rem] leading-relaxed pt-0.5">
          {item.question}
        </p>
      </div>

      {/* MCQ Options */}
      {isMCQ && options.length > 0 && (
        <div className="ml-11 space-y-1.5 mb-4">
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
        <div className="ml-11 mt-3 pt-3 border-t border-border/60">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary/70 mb-2">
            {isLongAnswer ? "Answer" : isShortAnswer ? "Answer" : "Ans"}
          </p>
          <div className={isLongAnswer || isShortAnswer ? "text-[0.935rem]" : ""}>
            <FormattedAnswer text={item.answer} />
          </div>
        </div>
      )}

      {/* MCQ Correct Answer */}
      {isMCQ && item.correct_option && !item.answer && (
        <div className="ml-11 mt-3 pt-3 border-t border-border/60">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary/70 mb-1">
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
