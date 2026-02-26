import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { classesData } from "@/data/classesData";
import { supabase } from "@/integrations/supabase/client";
import PageShell from "@/components/PageShell";
import DashboardHeader from "@/components/DashboardHeader";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ExercisePage = () => {
  const { classId, subjectId, chapterNumber } = useParams();
  const navigate = useNavigate();
  const cls = classesData.find((c) => c.id === Number(classId));
  const subject = cls?.subjects.find((s) => s.id === subjectId);
  const chapNum = Number(chapterNumber);

  const { data: exercises, isLoading } = useQuery({
    queryKey: ["exercises", classId, subjectId, chapterNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapter_exercises")
        .select("*")
        .eq("class_id", Number(classId))
        .eq("subject_id", subjectId || "")
        .eq("chapter_number", chapNum)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!classId && !!subjectId && !!chapterNumber,
  });

  const qaItems = exercises?.filter((e) => e.exercise_type === "qa") || [];
  const mcqItems = exercises?.filter((e) => e.exercise_type === "mcq") || [];

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
        ) : !exercises || exercises.length === 0 ? (
          <div className="text-center text-muted-foreground py-20">
            No exercises available yet for this chapter.
          </div>
        ) : (
          <div
            className="max-w-3xl"
            style={{
              animation: "slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.5s",
              opacity: 0,
            }}
          >
            <Tabs defaultValue={qaItems.length > 0 ? "qa" : "mcq"} className="w-full">
              <TabsList className="mb-6">
                {qaItems.length > 0 && <TabsTrigger value="qa">Questions & Answers</TabsTrigger>}
                {mcqItems.length > 0 && <TabsTrigger value="mcq">MCQs</TabsTrigger>}
              </TabsList>

              {qaItems.length > 0 && (
                <TabsContent value="qa">
                  <div className="space-y-5">
                    {qaItems.map((item, idx) => (
                      <QACard key={item.id} item={item} index={idx + 1} />
                    ))}
                  </div>
                </TabsContent>
              )}

              {mcqItems.length > 0 && (
                <TabsContent value="mcq">
                  <div className="space-y-5">
                    {mcqItems.map((item, idx) => (
                      <MCQCard key={item.id} item={item} index={idx + 1} />
                    ))}
                  </div>
                </TabsContent>
              )}
            </Tabs>
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

const QACard = ({ item, index }: { item: ExerciseItem; index: number }) => {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 transition-all">
      <p className="font-semibold text-foreground mb-3">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold mr-2">
          Q{index}
        </span>
        {item.question}
      </p>
      {item.answer && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary text-sm mb-2"
            onClick={() => setShowAnswer(!showAnswer)}
          >
            {showAnswer ? "Hide Answer" : "Show Answer"}
          </Button>
          {showAnswer && (
            <div className="pl-9 text-muted-foreground text-sm leading-relaxed whitespace-pre-line border-l-2 border-primary/20 ml-3 py-1">
              {item.answer}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const MCQCard = ({ item, index }: { item: ExerciseItem; index: number }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const options = (item.options as string[]) || [];
  const isAnswered = selected !== null;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 transition-all">
      <p className="font-semibold text-foreground mb-4">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold mr-2">
          {index}
        </span>
        {item.question}
      </p>
      <div className="grid gap-2 pl-9">
        {options.map((opt: string, i: number) => {
          const letter = String.fromCharCode(65 + i);
          const isCorrect = item.correct_option === letter || item.correct_option === opt;
          const isSelected = selected === letter;

          return (
            <button
              key={i}
              onClick={() => !isAnswered && setSelected(letter)}
              disabled={isAnswered}
              className={`flex items-center gap-3 text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                isAnswered
                  ? isCorrect
                    ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400"
                    : isSelected
                    ? "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400"
                    : "border-border text-muted-foreground opacity-60"
                  : "border-border hover:border-primary/50 hover:bg-primary/5 text-foreground cursor-pointer"
              }`}
            >
              <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0">
                {isAnswered && isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : isAnswered && isSelected ? (
                  <XCircle className="w-5 h-5 text-red-500" />
                ) : (
                  letter
                )}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
      {isAnswered && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 ml-9 text-primary text-xs"
          onClick={() => setSelected(null)}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ExercisePage;
