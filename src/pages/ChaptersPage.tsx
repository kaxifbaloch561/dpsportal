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

      <div className="flex-1 px-4 md:px-8 pb-8 overflow-y-auto">
        <h2
          className="text-2xl font-bold text-foreground mb-6 mt-4 text-center"
          style={{
            animation: "slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.3s",
            opacity: 0,
          }}
        >
          Chapters
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !chapters || chapters.length === 0 ? (
          <div className="text-center text-muted-foreground py-20">
            No chapters available yet for this subject.
          </div>
        ) : (
          <div
            className="max-w-3xl mx-auto grid gap-3"
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
                className="group relative w-full flex items-center gap-4 p-5 bg-card border border-border rounded-2xl text-left transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  animation: `slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards ${0.1 * idx + 0.5}s`,
                  opacity: 0,
                }}
              >
                {/* Number badge */}
                <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm font-black flex items-center justify-center shadow-md shrink-0 group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                  {ch.chapter_number}
                </span>

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <span className="text-base font-semibold text-foreground block truncate group-hover:text-primary transition-colors duration-300">
                    {ch.chapter_title}
                  </span>
                </div>

                {/* Arrow */}
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 shrink-0" />

                {/* Hover shimmer */}
                <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </button>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default ChaptersPage;
