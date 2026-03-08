import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useClassesData } from "@/hooks/useClassesData";
import { supabase } from "@/integrations/supabase/client";
import PageShell from "@/components/PageShell";
import DashboardHeader from "@/components/DashboardHeader";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { Loader2, BookOpen, ArrowRight } from "lucide-react";

const ChaptersPage = () => {
  const { classId, subjectId } = useParams();
  const navigate = useNavigate();
  const { data: classesData = [] } = useClassesData();
  const cls = classesData.find((c) => c.id === Number(classId));
  const subject = cls?.subjects.find((s) => s.id === subjectId);

  const { data: chapters, isLoading } = useQuery({
    queryKey: ["chapters", classId, subjectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapters")
        .select("id, chapter_number, chapter_title")
        .eq("class_id", Number(classId))
        .eq("subject_id", subjectId || "")
        .order("chapter_number", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!classId && !!subjectId,
  });

  if (!cls || !subject) return <div className="p-10 text-center">Not found</div>;

  return (
    <PageShell>
      <DashboardHeader showBack subtitle={`${cls.name} — ${subject.name} — Chapters`} />
      <BreadcrumbNav crumbs={[
        { label: "Dashboard", path: "/dashboard" },
        { label: cls.name, path: `/class/${cls.id}` },
        { label: subject.name, path: `/class/${cls.id}/subject/${subject.id}` },
        { label: "Chapters" },
      ]} />

      <div className="flex-1 px-3 sm:px-8 pb-6 sm:pb-8 overflow-y-auto">
        <div
          className="flex items-center gap-3 mb-3 sm:mb-5 mt-2 sm:mt-4"
          style={{ animation: "slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.3s", opacity: 0 }}
        >
          <div className="h-7 sm:h-8 w-1 rounded-full bg-gradient-to-b from-primary to-accent" />
          <h2 className="text-lg sm:text-2xl font-extrabold text-foreground tracking-tight">Chapters</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-border/60 to-transparent ml-2" />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !chapters || chapters.length === 0 ? (
          <div className="text-center text-muted-foreground py-20 text-sm">
            No chapters available yet for this subject.
          </div>
        ) : (
          <div
            className="max-w-3xl mx-auto grid gap-2 sm:gap-3"
            style={{
              animation: "slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.5s",
              opacity: 0,
            }}
          >
            {chapters.map((ch, idx) => (
              <button
                key={ch.id}
                onClick={() =>
                  navigate(`/class/${classId}/subject/${subjectId}/chapter/${ch.chapter_number}`)
                }
                className="group relative w-full flex items-center gap-3 sm:gap-4 p-3.5 sm:p-5 bg-card border border-border rounded-xl sm:rounded-2xl text-left transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  animation: `slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards ${0.1 * idx + 0.5}s`,
                  opacity: 0,
                }}
              >
                <span className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs sm:text-sm font-black flex items-center justify-center shadow-md shrink-0 group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                  {ch.chapter_number}
                </span>

                <div className="flex-1 min-w-0">
                  <span className="text-sm sm:text-base font-semibold text-foreground block truncate group-hover:text-primary transition-colors duration-300">
                    {ch.chapter_title}
                  </span>
                </div>

                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 shrink-0" />

                <span className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </button>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default ChaptersPage;