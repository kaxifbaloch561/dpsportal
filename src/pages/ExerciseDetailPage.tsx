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

const ExerciseCard = ({ item, index, exerciseType }: { item: ExerciseItem; index: number; exerciseType: string }) => {
  const isMCQ = exerciseType === "choose_correct_answer" || exerciseType === "true_false";
  const options = (item.options as string[]) || [];

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <p className="font-semibold text-foreground mb-3">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold mr-2">
          {index}
        </span>
        {item.question}
      </p>

      {isMCQ && options.length > 0 && (
        <div className="pl-9 space-y-1 mb-3">
          {options.map((opt: string, i: number) => {
            const letter = String.fromCharCode(65 + i);
            return (
              <p key={i} className="text-sm text-muted-foreground">
                ({letter.toLowerCase()}) {opt}
              </p>
            );
          })}
        </div>
      )}

      {/* Answer */}
      {item.answer && (
        <p className="pl-9 text-sm text-primary font-medium">
          <span className="text-muted-foreground font-normal">Ans: </span>
          {item.answer}
        </p>
      )}
      {isMCQ && item.correct_option && !item.answer && (
        <p className="pl-9 text-sm text-primary font-medium">
          <span className="text-muted-foreground font-normal">Correct Answer: </span>
          {item.correct_option.length === 1
            ? `(${item.correct_option.toLowerCase()}) ${options[item.correct_option.charCodeAt(0) - 65] || item.correct_option}`
            : item.correct_option}
        </p>
      )}
    </div>
  );
};

export default ExerciseDetailPage;
