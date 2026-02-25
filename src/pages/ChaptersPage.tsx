import { useParams } from "react-router-dom";
import { classesData, getChapters } from "@/data/classesData";
import { BookMarked } from "lucide-react";
import PageShell from "@/components/PageShell";
import DashboardHeader from "@/components/DashboardHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ChaptersPage = () => {
  const { classId, subjectId } = useParams();
  const cls = classesData.find((c) => c.id === Number(classId));
  const subject = cls?.subjects.find((s) => s.id === subjectId);
  const chapters = getChapters(Number(classId), subjectId || "");

  if (!cls || !subject) return <div className="p-10 text-center">Not found</div>;

  return (
    <PageShell>
      <DashboardHeader showBack subtitle={`${cls.name} — ${subject.name} — Chapters`} />

      <div className="flex-1 px-8 pb-8 overflow-y-auto">
        <div
          className="flex items-center gap-3 mb-6 mt-4"
          style={{
            animation: "slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.3s",
            opacity: 0,
          }}
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookMarked size={22} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Chapters</h2>
        </div>

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
                  <span>
                    <span className="text-primary mr-2">Ch {ch.number}.</span>
                    {ch.title}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="prose prose-sm text-muted-foreground leading-relaxed py-2">
                    {ch.content}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </PageShell>
  );
};

export default ChaptersPage;
