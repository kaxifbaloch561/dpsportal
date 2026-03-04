import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { classesData } from "@/data/classesData";
import { supabase } from "@/integrations/supabase/client";
import PageShell from "@/components/PageShell";
import DashboardHeader from "@/components/DashboardHeader";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { Loader2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormattedChapterContent from "@/components/chapter/FormattedChapterContent";

const ChapterViewPage = () => {
  const { classId, subjectId, chapterNumber } = useParams();
  const navigate = useNavigate();
  const cls = classesData.find((c) => c.id === Number(classId));
  const subject = cls?.subjects.find((s) => s.id === subjectId);

  const { data: chapter, isLoading } = useQuery({
    queryKey: ["chapter", classId, subjectId, chapterNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("class_id", Number(classId))
        .eq("subject_id", subjectId || "")
        .eq("chapter_number", Number(chapterNumber))
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!classId && !!subjectId && !!chapterNumber,
  });

  if (!cls || !subject) return <div className="p-10 text-center">Not found</div>;

  return (
    <PageShell>
      <DashboardHeader showBack subtitle={`${cls.name} — ${subject.name}`} />
      <BreadcrumbNav crumbs={[
        { label: "Dashboard", path: "/dashboard" },
        { label: cls.name, path: `/class/${cls.id}` },
        { label: subject.name, path: `/class/${cls.id}/subject/${subject.id}` },
        { label: "Chapters", path: `/class/${cls.id}/subject/${subject.id}/chapters` },
        { label: chapter ? `Ch ${chapter.chapter_number}` : "..." },
      ]} />

      <div className="flex-1 px-4 md:px-8 pb-8 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !chapter ? (
          <div className="text-center text-muted-foreground py-20">
            Chapter not found.
          </div>
        ) : (
          <div
            className="max-w-4xl mx-auto"
            style={{
              animation: "slideUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
              opacity: 0,
            }}
          >
            {/* Chapter Title Header */}
            <div className="flex items-center justify-between mt-4 mb-6">
              <div className="flex items-center gap-4">
                <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground text-lg font-black flex items-center justify-center shadow-lg">
                  {chapter.chapter_number}
                </span>
                <h2 className="text-2xl font-bold text-foreground">{chapter.chapter_title}</h2>
              </div>
              <Button
                onClick={() =>
                  navigate(`/class/${classId}/subject/${subjectId}/chapter/${chapter.chapter_number}/exercise`)
                }
                className="gap-2 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg"
              >
                <ClipboardList className="w-4 h-4" />
                Exercise
              </Button>
            </div>

            {/* Chapter Content — each topic renders as its own card */}
            <FormattedChapterContent content={chapter.content} />
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default ChapterViewPage;
