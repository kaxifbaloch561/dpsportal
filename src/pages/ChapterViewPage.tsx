import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { classesData } from "@/data/classesData";
import { supabase } from "@/integrations/supabase/client";
import PageShell from "@/components/PageShell";
import DashboardHeader from "@/components/DashboardHeader";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { Loader2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";

/* ── Professional Book-Style Content Renderer ── */
/* ── Preprocess unformatted content to inject structural breaks ── */
function preprocessContent(raw: string): string {
  // If content already has markdown formatting with enough lines, return as-is
  const lineCount = raw.split("\n").length;
  if (raw.includes("**") && lineCount > 30) return raw;
  // If already well-structured with many lines, return as-is
  if (lineCount > 50) return raw;

  let text = raw;

  // ─── PHASE 1: Inject line breaks before heading patterns ───
  // Works on wall-of-text content with very few newlines.
  // Strategy: insert \n\n BEFORE the heading pattern.

  // 1) Break before numbered main headings: "1. Title Words"
  text = text.replace(
    /(?<=[\.\!\?]["'\s])\s*(?=\d+\.\s+[A-Z][a-z])/g,
    "\n\n"
  );

  // 2) Lettered sub-headings with period: "a. First Five Year Plan (1955-60)"
  text = text.replace(
    /(?<=[\.\!\?]["'\s])\s*(?=([a-i]\.\s+[A-Z][A-Za-z]))/g,
    "\n\n"
  );

  // 3) Roman numeral sub-headings with period: "i. Mining", "ii. Agriculture"
  text = text.replace(
    /(?<=[\.\!\?]["'\s])\s*(?=((?:i|ii|iii|iv|v|vi|vii|viii|ix|x)\.\s+[A-Z][A-Za-z]))/g,
    "\n\n"
  );

  // 4) Lettered sub-headings with paren: "a) Primary Sector:" "b) Reforms"
  text = text.replace(
    /(?<=[\.\!\?]["'\s])\s*(?=([a-z]\)\s+[A-Z][A-Za-z]))/g,
    "\n\n"
  );

  // 5) Roman numeral sub-headings with paren: "i) Use of Chemical Fertilizer:"
  text = text.replace(
    /(?<=[\.\!\?]["'\s])\s*(?=((?:i|ii|iii|iv|v|vi|vii|viii|ix|x)\)\s+[A-Z][A-Za-z]))/g,
    "\n\n"
  );

  // 6) Parenthetical roman numerals as list items: "(i) To explore..."
  text = text.replace(
    /(?<=[\.\!\?:]["'\s])\s*(?=\([ivx]+\)\s+[A-Z])/g,
    "\n"
  );

  // 7) Label lines: "Learning Outcomes:" etc.
  text = text.replace(/(?:^|\s)(Learning Outcomes|Objectives|Summary|Conclusion|Introduction):\s*/gi, "\n\n**$1:**\n");

  // ─── PHASE 2: Split heading+body lines and format ───
  // After phase 1, lines may start with a heading pattern followed by body text.
  // E.g. "1. Economic Development in Pakistan At the time of..."
  // We need to split these into heading line + body line.

  const headingPatterns = [
    // Numbered: "1. Economic Development in Pakistan" — allow lowercase connector words
    /^(\d+\.\s+(?:[A-Za-z,()'\u2019-]+\s*){2,}?)(?=(?:At the |The [a-z]|In [a-z]|This |It [a-z]|After |During |As [a-z]|Its |However,? |There |Upto |According |But [a-z]|One |Although |With the |Under |These |About |That |Most |Almost |General |For the |To [a-z]|No [a-z]|An? [a-z]))/,
    // Lettered with period: "a. First Five Year Plan (1955-60)"
    /^([a-i]\.\s+(?:[A-Za-z0-9,()'\u2019-]+\s*){2,}?)(?=(?:In [a-z]|The [a-z]|This |It |After |During |As |However |There |At the |Under |These |To [a-z]|For the ))/,
    // Roman with period: "i. Medium Term Development Plan (2005-10)"
    /^((?:i|ii|iii|iv|v|vi|vii|viii|ix|x)\.\s+(?:[A-Za-z0-9,()'\u2019-]+\s*){1,}?)(?=(?:After |The [a-z]|This |In [a-z]|It |Pakistan |At the |However |Like |There |Improved ))/,
    // Lettered with paren: "a) Cottage Industry" "b) Reforms"
    /^([a-z]\)\s+(?:[A-Za-z0-9,()'\u2019:-]+\s*){1,}?)(?=(?:In [a-z]|The [a-z]|This |It |After |During |As |However |There |At |These |Most |They |To [a-z]|It is ))/,
    // Roman with paren: "i) Use of Chemical Fertilizer:" "ii) Use of Machinery:"
    /^((?:i|ii|iii|iv|v|vi|vii|viii|ix|x)\)\s+(?:[A-Za-z0-9,()'\u2019:-]+\s*){1,}?)(?=(?:Today |The [a-z]|In [a-z]|This |It |Like |Improved |Pakistan ))/,
  ];

  const lines = text.split("\n");
  const expanded: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("**")) {
      expanded.push(line);
      continue;
    }
    let matched = false;
    for (const pat of headingPatterns) {
      const m = trimmed.match(pat);
      if (m && m[1].length > 5 && m[1].length < 150) {
        expanded.push(`**${m[1].trim()}**`);
        const body = trimmed.slice(m[1].length).trim();
        if (body) expanded.push(body);
        matched = true;
        break;
      }
    }
    if (!matched) {
      // Pure heading lines (entire line is a heading)
      const pureNum = trimmed.match(/^(\d+\.\s+[A-Z][A-Za-z\s,()'\u2019-]+)$/);
      if (pureNum && pureNum[1].length > 10 && pureNum[1].length < 120) {
        expanded.push(`**${trimmed}**`);
        continue;
      }
      const pureLet = trimmed.match(/^([a-i]\.\s+[A-Z][A-Za-z0-9\s,()'\u2019-]+)$/);
      if (pureLet && pureLet[1].length > 8 && pureLet[1].length < 120) {
        expanded.push(`**${trimmed}**`);
        continue;
      }
      const pureRom = trimmed.match(/^((?:i|ii|iii|iv|v|vi|vii|viii|ix|x)\.\s+[A-Z][A-Za-z0-9\s,()'\u2019-]+)$/);
      if (pureRom && pureRom[1].length > 5 && pureRom[1].length < 120) {
        expanded.push(`**${trimmed}**`);
        continue;
      }
      expanded.push(line);
    }
  }

  // ─── PHASE 3: Split long paragraphs into readable chunks ───
  const processed = expanded.map(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("**") || trimmed.length < 400) return line;
    const sentences = trimmed.split(/(?<=[.!?]["']?)\s+(?=[A-Z])/);
    if (sentences.length <= 3) return line;
    const chunks: string[] = [];
    for (let i = 0; i < sentences.length; i += 4) {
      chunks.push(sentences.slice(i, i + 4).join(" "));
    }
    return chunks.join("\n\n");
  });

  return processed.join("\n");
}

const FormattedChapterContent = ({ content }: { content: string }) => {
  const processed = preprocessContent(content);
  const sections = processed.split(/\n---\n/);

  return (
    <div className="py-6 px-4 md:px-8 space-y-1">
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

    const fullBoldMatch = trimmed.match(/^\*\*(.*?)\*\*$/);
    if (fullBoldMatch) {
      const headingText = fullBoldMatch[1];
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
      elements.push(
        <h3 key={i} className="text-lg font-bold text-foreground mt-6 mb-2 leading-snug">
          {headingText}
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith("- ")) {
      elements.push(
        <div key={i} className="flex items-start gap-2.5 pl-4 py-0.5 text-sm text-muted-foreground leading-relaxed">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
          <span className="flex-1">{parseInlineBold(trimmed.slice(2))}</span>
        </div>
      );
      continue;
    }

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

    // Plain-text numbered main heading (e.g. "1. Economic Development in Pakistan")
    const plainNumberedHeading = trimmed.match(/^(\d+)\.\s+([A-Z][A-Za-z\s,()'-]+)$/);
    if (plainNumberedHeading && plainNumberedHeading[2].length > 10 && plainNumberedHeading[2].length < 120) {
      elements.push(
        <h2 key={i} className="text-xl font-extrabold text-foreground mt-8 mb-3 flex items-center gap-3 leading-tight">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm font-black shadow-lg shrink-0">
            {plainNumberedHeading[1]}
          </span>
          <span>{plainNumberedHeading[2]}</span>
        </h2>
      );
      continue;
    }

    // Plain-text lettered sub-heading (e.g. "a. First Five Year Plan (1955-60)")
    const plainLetterHeading = trimmed.match(/^([a-z])\.\s+([A-Z][A-Za-z0-9\s,()'-]+)$/);
    if (plainLetterHeading && plainLetterHeading[2].length > 8 && plainLetterHeading[2].length < 120) {
      elements.push(
        <h4 key={i} className="text-base font-bold text-foreground mt-5 mb-2 flex items-start gap-2 leading-snug">
          <span className="text-primary font-black shrink-0">{plainLetterHeading[1]}.</span>
          <span>{plainLetterHeading[2]}</span>
        </h4>
      );
      continue;
    }

    // "Title:" label lines (e.g. "Learning Outcomes:")
    const labelMatch = trimmed.match(/^([A-Z][A-Za-z\s]{2,30}):\s*$/);
    if (labelMatch) {
      elements.push(
        <h3 key={i} className="text-lg font-bold text-foreground mt-6 mb-2 leading-snug">
          {labelMatch[1]}
        </h3>
      );
      continue;
    }

    elements.push(
      <p key={i} className="text-sm text-muted-foreground leading-[1.9] py-1">
        {parseInlineBold(trimmed)}
      </p>
    );
  }

  return <>{elements}</>;
}

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

            {/* Chapter Content Card */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <FormattedChapterContent content={chapter.content} />
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default ChapterViewPage;
