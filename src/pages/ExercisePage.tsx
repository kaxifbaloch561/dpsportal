import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useClassesData } from "@/hooks/useClassesData";
import { supabase } from "@/integrations/supabase/client";
import PageShell from "@/components/PageShell";
import DashboardHeader from "@/components/DashboardHeader";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { Loader2, ClipboardList } from "lucide-react";

const EXERCISE_TYPE_LABELS: Record<string, string> = {
  fill_in_the_blanks: "Fill in the Blanks",
  choose_correct_answer: "Choose the Correct Answer",
  match_columns: "Match the Columns",
  true_false: "True and False",
  long_question_answers: "Long Question Answers",
  short_question_answers: "Short Question Answers",
};

const ExercisePage = () => {
  const { classId, subjectId, chapterNumber } = useParams();
  const navigate = useNavigate();
  const { data: classesData = [] } = useClassesData();
  const cls = classesData.find((c) => c.id === Number(classId));
  const subject = cls?.subjects.find((s) => s.id === subjectId);
  const chapNum = Number(chapterNumber);

  const { data: availableTypes, isLoading } = useQuery({
    queryKey: ["exercise-types", classId, subjectId, chapterNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapter_exercises")
        .select("exercise_type")
        .eq("class_id", Number(classId))
        .eq("subject_id", subjectId || "")
        .eq("chapter_number", chapNum);

      if (error) throw error;
      const types = [...new Set(data.map((d) => d.exercise_type))];
      return types;
    },
    enabled: !!classId && !!subjectId && !!chapterNumber,
  });

  if (!cls || !subject) return <div className="p-10 text-center">Not found</div>;

  return (
    <PageShell>
      <DashboardHeader showBack subtitle={`${cls.name} — ${subject.name} — Chapter ${chapNum} Exercise`} />
      <BreadcrumbNav crumbs={[
        { label: "Dashboard", path: "/dashboard" },
        { label: cls.name, path: `/class/${cls.id}` },
        { label: subject.name, path: `/class/${cls.id}/subject/${subject.id}` },
        { label: "Chapters", path: `/class/${cls.id}/subject/${subject.id}/chapters` },
        { label: `Ch ${chapNum} Exercise` },
      ]} />

      <div className="flex-1 px-4 sm:px-8 pb-8 overflow-y-auto">
        <h2
          className="text-2xl font-bold text-foreground mb-6 mt-4"
          style={{
            animation: "slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.3s",
            opacity: 0,
          }}
        >
          Chapter {chapNum} — Exercise
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !availableTypes || availableTypes.length === 0 ? (
          <div className="text-center text-muted-foreground py-20">
            No exercises available yet for this chapter.
          </div>
        ) : (
          <div
            className="max-w-2xl grid gap-3"
            style={{
              animation: "slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.5s",
              opacity: 0,
            }}
          >
            {availableTypes
              .sort((a, b) => Object.keys(EXERCISE_TYPE_LABELS).indexOf(a) - Object.keys(EXERCISE_TYPE_LABELS).indexOf(b))
              .map((type, index) => (
                <button
                  key={type}
                  onClick={() =>
                    navigate(
                      `/class/${classId}/subject/${subjectId}/chapter/${chapterNumber}/exercise/${type}`
                    )
                  }
                  className="group relative flex items-center gap-4 h-auto py-5 px-6 rounded-2xl border border-border bg-card text-left text-base font-semibold text-foreground transition-all duration-300 ease-out hover:border-primary/50 hover:shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.25)] hover:-translate-y-0.5 hover:bg-gradient-to-r hover:from-primary/[0.04] hover:to-transparent"
                  style={{
                    animation: `slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards ${0.1 * index}s`,
                    opacity: 0,
                  }}
                >
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md group-hover:scale-110">
                    <ClipboardList className="w-5 h-5" />
                  </span>
                  <span className="flex-1">{EXERCISE_TYPE_LABELS[type] || type}</span>
                  <span className="text-muted-foreground/40 transition-all duration-300 group-hover:text-primary group-hover:translate-x-1">
                    →
                  </span>
                </button>
              ))}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default ExercisePage;
