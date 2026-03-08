import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useClassesData } from "@/hooks/useClassesData";
import { supabase } from "@/integrations/supabase/client";
import PageShell from "@/components/PageShell";
import DashboardHeader from "@/components/DashboardHeader";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import {
  Loader2, PenLine, CheckCircle2, Columns3, ToggleLeft,
  FileText, MessageSquareText, BookOpen, ChevronRight
} from "lucide-react";

const EXERCISE_TYPES_CONFIG: Record<string, { label: string; icon: any; gradient: string; description: string }> = {
  fill_in_the_blanks: {
    label: "Fill in the Blanks",
    icon: PenLine,
    gradient: "from-blue-500 to-cyan-500",
    description: "Complete sentences with the correct words",
  },
  choose_correct_answer: {
    label: "Choose the Correct Answer",
    icon: CheckCircle2,
    gradient: "from-emerald-500 to-teal-500",
    description: "Select the right option from multiple choices",
  },
  match_columns: {
    label: "Match the Columns",
    icon: Columns3,
    gradient: "from-violet-500 to-purple-500",
    description: "Connect related items from two columns",
  },
  true_false: {
    label: "True and False",
    icon: ToggleLeft,
    gradient: "from-amber-500 to-orange-500",
    description: "Determine whether statements are correct",
  },
  long_question_answers: {
    label: "Long Question Answers",
    icon: FileText,
    gradient: "from-rose-500 to-pink-500",
    description: "Detailed answers for comprehensive questions",
  },
  short_question_answers: {
    label: "Short Question Answers",
    icon: MessageSquareText,
    gradient: "from-indigo-500 to-blue-500",
    description: "Brief and concise answers to questions",
  },
};

const TYPE_ORDER = Object.keys(EXERCISE_TYPES_CONFIG);

const ExercisePage = () => {
  const { classId, subjectId, chapterNumber } = useParams();
  const navigate = useNavigate();
  const { data: classesData = [] } = useClassesData();
  const cls = classesData.find((c) => c.id === Number(classId));
  const subject = cls?.subjects.find((s) => s.id === subjectId);
  const chapNum = Number(chapterNumber);

  const { data: exerciseCounts, isLoading } = useQuery({
    queryKey: ["exercise-types-counts", classId, subjectId, chapterNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapter_exercises")
        .select("exercise_type")
        .eq("class_id", Number(classId))
        .eq("subject_id", subjectId || "")
        .eq("chapter_number", chapNum);

      if (error) throw error;
      const counts: Record<string, number> = {};
      data.forEach((d) => {
        counts[d.exercise_type] = (counts[d.exercise_type] || 0) + 1;
      });
      return counts;
    },
    enabled: !!classId && !!subjectId && !!chapterNumber,
  });

  if (!cls || !subject) return <div className="p-10 text-center">Not found</div>;

  const availableTypes = exerciseCounts ? Object.keys(exerciseCounts).sort(
    (a, b) => TYPE_ORDER.indexOf(a) - TYPE_ORDER.indexOf(b)
  ) : [];
  const totalQuestions = exerciseCounts ? Object.values(exerciseCounts).reduce((a, b) => a + b, 0) : 0;

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

      <div className="flex-1 px-3 sm:px-8 pb-6 sm:pb-8 overflow-y-auto">
        {/* Hero Header */}
        <div
          className="mt-3 sm:mt-4 mb-5 sm:mb-8"
          style={{ animation: "slideUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards", opacity: 0 }}
        >
          <div className="flex items-center gap-3 sm:gap-4 mb-2">
            <div className="flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/25">
              <BookOpen className="w-5 h-5 sm:w-7 sm:h-7 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-foreground tracking-tight">
                Chapter {chapNum} — Exercise
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Practice questions to test your understanding
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          {exerciseCounts && availableTypes.length > 0 && (
            <div className="flex gap-2 sm:gap-4 mt-3 sm:mt-5">
              <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-card border border-border/60">
                <span className="text-[9px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">Categories</span>
                <span className="text-xs sm:text-sm font-extrabold text-primary">{availableTypes.length}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-card border border-border/60">
                <span className="text-[9px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">Questions</span>
                <span className="text-xs sm:text-sm font-extrabold text-primary">{totalQuestions}</span>
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : availableTypes.length === 0 ? (
          <div className="text-center text-muted-foreground py-20 bg-card/50 rounded-2xl border border-border/40 text-sm">
            No exercises available yet for this chapter.
          </div>
        ) : (
          <div className="max-w-3xl grid gap-2.5 sm:gap-4">
            {availableTypes.map((type, index) => {
              const config = EXERCISE_TYPES_CONFIG[type];
              if (!config) return null;
              const Icon = config.icon;
              const count = exerciseCounts?.[type] || 0;

              return (
                <button
                  key={type}
                  onClick={() =>
                    navigate(`/class/${classId}/subject/${subjectId}/chapter/${chapterNumber}/exercise/${type}`)
                  }
                  className="group relative flex items-center gap-3 sm:gap-5 py-3.5 sm:py-5 px-3.5 sm:px-6 rounded-xl sm:rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm text-left transition-all duration-300 ease-out hover:border-primary/40 hover:shadow-[0_12px_40px_-12px_hsl(var(--primary)/0.2)] hover:-translate-y-1 active:scale-[0.99]"
                  style={{
                    animation: `slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards ${0.08 * index + 0.2}s`,
                    opacity: 0,
                  }}
                >
                  <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${config.gradient} text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl shrink-0`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors duration-200 truncate">
                        {config.label}
                      </h3>
                      <span className="inline-flex items-center justify-center min-w-[22px] sm:min-w-[28px] h-5 sm:h-6 px-1.5 sm:px-2 rounded-full bg-primary/10 text-primary text-[10px] sm:text-[11px] font-extrabold border border-primary/15 shrink-0">
                        {count}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 leading-relaxed truncate sm:whitespace-normal">
                      {config.description}
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground/30 transition-all duration-300 group-hover:text-primary group-hover:translate-x-1 shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default ExercisePage;