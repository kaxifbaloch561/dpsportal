import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { classesData } from "@/data/classesData";
import { supabase } from "@/integrations/supabase/client";
import PageShell from "@/components/PageShell";
import DashboardHeader from "@/components/DashboardHeader";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

const ChaptersPage = () => {
  const { classId, subjectId } = useParams();
  const navigate = useNavigate();
  const cls = classesData.find((c) => c.id === Number(classId));
  const subject = cls?.subjects.find((s) => s.id === subjectId);

  const { data: chapters, isLoading } = useQuery({
    queryKey: ["chapters", classId, subjectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapters")
        .select("*")
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

      <div className="flex-1 px-8 pb-8 overflow-y-auto">
        <h2
          className="text-2xl font-bold text-foreground mb-6 mt-4"
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
            className="max-w-3xl"
            style={{
              animation: "slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.5s",
              opacity: 0,
            }}
          >
            <Accordion type="single" collapsible className="space-y-3">
              {chapters.map((ch) => (
                <AccordionItem
                  key={ch.id}
                  value={ch.id}
                  className="bg-card border border-border rounded-2xl px-6 overflow-hidden"
                >
                  <AccordionTrigger className="text-base font-semibold hover:no-underline">
                    <span className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(235,78%,65%)] to-[hsl(260,70%,60%)] text-white text-xs font-bold flex items-center justify-center shadow-sm">
                        {ch.chapter_number}
                      </span>
                      {ch.chapter_title}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="prose prose-sm text-muted-foreground leading-relaxed py-2 pl-11 max-h-[70vh] overflow-y-auto whitespace-pre-line">
                      {ch.content.split(/\*\*(.*?)\*\*/g).map((part, i) =>
                        i % 2 === 1 ? (
                          <strong key={i} className="text-foreground block mt-4 mb-1">
                            {part}
                          </strong>
                        ) : (
                          <span key={i}>{part}</span>
                        )
                      )}
                    </div>

                    <div className="pl-11 pt-4 pb-2">
                      <Button
                        onClick={() =>
                          navigate(
                            `/class/${classId}/subject/${subjectId}/chapter/${ch.chapter_number}/exercise`
                          )
                        }
                        className="gap-2 rounded-xl bg-gradient-to-r from-[hsl(235,78%,65%)] to-[hsl(260,70%,60%)] hover:opacity-90 text-white shadow-md"
                      >
                        <ClipboardList className="w-4 h-4" />
                        Exercise
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default ChaptersPage;
