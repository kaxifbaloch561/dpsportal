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
import React from "react";

/* ── Professional Book-Style Content Renderer ── */
const FormattedChapterContent = ({ content }: { content: string }) => {
  // Split by --- for section dividers
  const sections = content.split(/\n---\n/);

  return (
    <div className="py-4 pl-2 pr-2 space-y-1">
      {sections.map((section, sIdx) => (
        <React.Fragment key={sIdx}>
          {sIdx > 0 && (
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>
          )}
          {renderSection(section)}
        </React.Fragment>
      ))}
    </div>
  );
};

function renderSection(section: string) {
  const lines = section.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(<div key={i} className="h-2" />);
      continue;
    }

    // Parse inline bold **text** within a line
    const parseInlineBold = (text: string): React.ReactNode[] => {
      const parts = text.split(/\*\*(.*?)\*\*/g);
      return parts.map((part, idx) =>
        idx % 2 === 1 ? (
          <strong key={idx} className="text-foreground font-bold">{part}</strong>
        ) : (
          <span key={idx}>{part}</span>
        )
      );
    };

    // Check if entire line is bold heading: **text**
    const fullBoldMatch = trimmed.match(/^\*\*(.*?)\*\*$/);
    if (fullBoldMatch) {
      const headingText = fullBoldMatch[1];

      // Main section headings like "1. Zulfiqar Ali Bhutto..."
      const numberedMain = headingText.match(/^(\d+)\.\s+(.+)/);
      if (numberedMain) {
        elements.push(
          <h2 key={i} className="text-xl font-extrabold text-foreground mt-8 mb-3 flex items-center gap-3 leading-tight">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm font-black shadow-lg shrink-0">
              {numberedMain[1]}
            </span>
            <span>{numberedMain[2]}</span>
          </h2>
        );
        continue;
      }

      // Roman numeral headings like "I. Economic Reforms"
      const romanMain = headingText.match(/^([IVX]+)\.\s+(.+)/);
      if (romanMain) {
        elements.push(
          <h3 key={i} className="text-lg font-bold text-foreground mt-6 mb-2 flex items-center gap-2.5 leading-snug">
            <span className="inline-flex items-center justify-center min-w-[28px] h-7 rounded-lg bg-primary/15 text-primary text-xs font-black px-1.5">
              {romanMain[1]}
            </span>
            <span>{romanMain[2]}</span>
          </h3>
        );
        continue;
      }

      // Sub-headings like "(a) Agricultural Reforms" or "i) Benazir Government..."
      const subMatch = headingText.match(/^(\([a-z]\)|\w+\))\s+(.+)/);
      if (subMatch) {
        elements.push(
          <h4 key={i} className="text-base font-bold text-foreground mt-5 mb-2 flex items-start gap-2 leading-snug">
            <span className="text-primary font-black shrink-0">{subMatch[1]}</span>
            <span>{subMatch[2]}</span>
          </h4>
        );
        continue;
      }

      // Numbered sub-headings like "1) Union Council:"
      const numberedSub = headingText.match(/^(\d+\))\s+(.+)/);
      if (numberedSub) {
        elements.push(
          <h4 key={i} className="text-base font-bold text-foreground mt-5 mb-2 flex items-start gap-2 leading-snug">
            <span className="inline-flex items-center justify-center min-w-[24px] h-6 rounded-md bg-accent/15 text-accent-foreground text-xs font-black px-1">
              {numberedSub[1]}
            </span>
            <span>{numberedSub[2]}</span>
          </h4>
        );
        continue;
      }

      // Generic bold heading
      elements.push(
        <h3 key={i} className="text-lg font-bold text-foreground mt-6 mb-2 leading-snug">
          {headingText}
        </h3>
      );
      continue;
    }

    // Bullet points: - text
    if (trimmed.startsWith("- ")) {
      elements.push(
        <div key={i} className="flex items-start gap-2.5 pl-4 py-0.5 text-sm text-muted-foreground leading-relaxed">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
          <span className="flex-1">{parseInlineBold(trimmed.slice(2))}</span>
        </div>
      );
      continue;
    }

    // Roman numeral list items: i. / ii. / iii. / iv. etc.
    const romanListMatch = trimmed.match(/^([ivxlc]+)\.\s+(.+)/i);
    if (romanListMatch && /^[ivxlc]+$/i.test(romanListMatch[1]) && romanListMatch[1].length <= 5) {
      elements.push(
        <div key={i} className="flex items-start gap-2.5 pl-6 py-1 text-sm text-muted-foreground leading-[1.8]">
          <span className="min-w-[28px] text-primary/80 font-semibold text-xs mt-0.5 shrink-0">{romanListMatch[1]}.</span>
          <span className="flex-1">{parseInlineBold(romanListMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Numbered dash list: 1- / 2- / 10- etc.
    const numDashMatch = trimmed.match(/^(\d+)-\s+(.+)/);
    if (numDashMatch) {
      elements.push(
        <div key={i} className="flex items-start gap-2.5 pl-6 py-1 text-sm text-muted-foreground leading-[1.8]">
          <span className="inline-flex items-center justify-center min-w-[22px] h-5 rounded bg-primary/10 text-primary text-[11px] font-bold shrink-0 mt-0.5">
            {numDashMatch[1]}
          </span>
          <span className="flex-1">{parseInlineBold(numDashMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Sub-items with parenthetical markers: (a) text, i) text
    const parenMatch = trimmed.match(/^(\([a-z]\)|\w+\))\s+(.+)/);
    if (parenMatch && !trimmed.startsWith("**")) {
      elements.push(
        <div key={i} className="flex items-start gap-2 pl-6 py-1 text-sm text-muted-foreground leading-[1.8]">
          <span className="text-primary/70 font-semibold shrink-0">{parenMatch[1]}</span>
          <span className="flex-1">{parseInlineBold(parenMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Regular paragraph with inline bold support
    elements.push(
      <p key={i} className="text-sm text-muted-foreground leading-[1.9] py-1">
        {parseInlineBold(trimmed)}
      </p>
    );
  }

  return <>{elements}</>;
}

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
                  <div className="flex items-center gap-2">
                    <AccordionTrigger className="text-base font-semibold hover:no-underline flex-1">
                      <span className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs font-bold flex items-center justify-center shadow-sm">
                          {ch.chapter_number}
                        </span>
                        {ch.chapter_title}
                      </span>
                    </AccordionTrigger>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(
                          `/class/${classId}/subject/${subjectId}/chapter/${ch.chapter_number}/exercise`
                        );
                      }}
                      className="gap-1.5 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-md shrink-0 text-xs"
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                      Exercise
                    </Button>
                  </div>
                  <AccordionContent>
                    <div className="max-h-[70vh] overflow-y-auto pl-8 scrollbar-thin">
                      <FormattedChapterContent content={ch.content} />
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
