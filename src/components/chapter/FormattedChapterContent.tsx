import React from "react";
import { preprocessContent } from "@/utils/chapterContentParser";
import { plainTextToHtml } from "@/utils/plainTextToHtml";

const parseInlineBold = (text: string): React.ReactNode[] => {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, idx) =>
    idx % 2 === 1 ? (
      <strong key={idx} className="text-foreground font-semibold">{part}</strong>
    ) : (
      <span key={idx}>{part}</span>
    )
  );
};

function renderSection(section: string, sectionIndex: number) {
  const lines = section.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(<div key={i} className="h-3" />);
      continue;
    }

    // Bold-wrapped headings
    const fullBoldMatch = trimmed.match(/^\*\*(.*?)\*\*$/);
    if (fullBoldMatch) {
      const headingText = fullBoldMatch[1];
      const numberedMain = headingText.match(/^(\d+)\.\s+(.+)/);
      if (numberedMain) {
        elements.push(
          <div key={i} className="flex items-center gap-3.5 mt-2 mb-4">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm font-black shadow-lg shadow-primary/25 shrink-0">
              {numberedMain[1]}
            </span>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">{numberedMain[2]}</h2>
          </div>
        );
        continue;
      }
      const romanMain = headingText.match(/^([IVX]+)\.\s+(.+)/);
      if (romanMain) {
        elements.push(
          <div key={i} className="flex items-center gap-2.5 mt-5 mb-3">
            <span className="inline-flex items-center justify-center min-w-[30px] h-7 rounded-lg bg-primary/10 text-primary text-xs font-black px-2 border border-primary/20">
              {romanMain[1]}
            </span>
            <h3 className="text-lg font-bold text-foreground">{romanMain[2]}</h3>
          </div>
        );
        continue;
      }
      const subMatch = headingText.match(/^(\([a-z]\)|\w+\))\s+(.+)/);
      if (subMatch) {
        elements.push(
          <div key={i} className="flex items-start gap-2 mt-4 mb-2 pl-1">
            <span className="text-primary font-black shrink-0 text-sm">{subMatch[1]}</span>
            <h4 className="text-base font-bold text-foreground">{subMatch[2]}</h4>
          </div>
        );
        continue;
      }
      const numberedSub = headingText.match(/^(\d+\))\s+(.+)/);
      if (numberedSub) {
        elements.push(
          <div key={i} className="flex items-start gap-2 mt-4 mb-2 pl-1">
            <span className="inline-flex items-center justify-center min-w-[24px] h-6 rounded-md bg-accent/10 text-accent-foreground text-xs font-black px-1 border border-accent/20">
              {numberedSub[1]}
            </span>
            <h4 className="text-base font-bold text-foreground">{numberedSub[2]}</h4>
          </div>
        );
        continue;
      }
      elements.push(
        <h3 key={i} className="text-lg font-bold text-foreground mt-5 mb-2.5 border-l-[3px] border-primary/40 pl-3">
          {headingText}
        </h3>
      );
      continue;
    }

    // Bullet items
    if (trimmed.startsWith("- ")) {
      elements.push(
        <div key={i} className="flex items-start gap-3 pl-4 py-1 group">
          <span className="mt-[9px] w-1.5 h-1.5 rounded-full bg-gradient-to-br from-primary to-accent shrink-0 group-hover:scale-150 transition-transform" />
          <span className="flex-1 text-sm text-muted-foreground leading-[1.85]">{parseInlineBold(trimmed.slice(2))}</span>
        </div>
      );
      continue;
    }

    // Roman numeral list items
    const romanListMatch = trimmed.match(/^([ivxlc]+)\.\s+(.+)/i);
    if (romanListMatch && /^[ivxlc]+$/i.test(romanListMatch[1]) && romanListMatch[1].length <= 5) {
      elements.push(
        <div key={i} className="flex items-start gap-2.5 pl-5 py-1">
          <span className="min-w-[28px] text-primary/80 font-semibold text-xs mt-0.5 shrink-0">{romanListMatch[1]}.</span>
          <span className="flex-1 text-sm text-muted-foreground leading-[1.85]">{parseInlineBold(romanListMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Numbered-dash items
    const numDashMatch = trimmed.match(/^(\d+)-\s+(.+)/);
    if (numDashMatch) {
      elements.push(
        <div key={i} className="flex items-start gap-2.5 pl-5 py-1">
          <span className="inline-flex items-center justify-center min-w-[22px] h-5 rounded-md bg-primary/8 text-primary text-[11px] font-bold shrink-0 mt-0.5 border border-primary/15">
            {numDashMatch[1]}
          </span>
          <span className="flex-1 text-sm text-muted-foreground leading-[1.85]">{parseInlineBold(numDashMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Paren-labeled items
    const parenMatch = trimmed.match(/^(\([a-z]\)|\w+\))\s+(.+)/);
    if (parenMatch && !trimmed.startsWith("**")) {
      elements.push(
        <div key={i} className="flex items-start gap-2 pl-5 py-1">
          <span className="text-primary/70 font-semibold shrink-0 text-sm">{parenMatch[1]}</span>
          <span className="flex-1 text-sm text-muted-foreground leading-[1.85]">{parseInlineBold(parenMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Plain numbered heading
    const plainNumberedHeading = trimmed.match(/^(\d+)\.\s+([A-Z][A-Za-z\s,()'-]+)$/);
    if (plainNumberedHeading && plainNumberedHeading[2].length > 10 && plainNumberedHeading[2].length < 120) {
      elements.push(
        <div key={i} className="flex items-center gap-3.5 mt-2 mb-4">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm font-black shadow-lg shadow-primary/25 shrink-0">
            {plainNumberedHeading[1]}
          </span>
          <h2 className="text-xl font-extrabold text-foreground tracking-tight">{plainNumberedHeading[2]}</h2>
        </div>
      );
      continue;
    }

    // Plain lettered heading
    const plainLetterHeading = trimmed.match(/^([a-z])\.\s+([A-Z][A-Za-z0-9\s,()'-]+)$/);
    if (plainLetterHeading && plainLetterHeading[2].length > 8 && plainLetterHeading[2].length < 120) {
      elements.push(
        <div key={i} className="flex items-start gap-2 mt-4 mb-2 pl-1">
          <span className="text-primary font-black shrink-0 text-sm">{plainLetterHeading[1]}.</span>
          <h4 className="text-base font-bold text-foreground">{plainLetterHeading[2]}</h4>
        </div>
      );
      continue;
    }

    // Label lines
    const labelMatch = trimmed.match(/^([A-Z][A-Za-z\s]{2,30}):\s*$/);
    if (labelMatch) {
      elements.push(
        <h3 key={i} className="text-lg font-bold text-foreground mt-5 mb-2.5 border-l-[3px] border-primary/40 pl-3">
          {labelMatch[1]}
        </h3>
      );
      continue;
    }

    // Lettered sub-heading
    const plainLetterSub = trimmed.match(/^([a-i])\.\s+([A-Z][A-Za-z0-9\s,()'-]{8,120})$/);
    if (plainLetterSub) {
      elements.push(
        <div key={i} className="flex items-start gap-2 mt-4 mb-2 pl-1">
          <span className="text-primary font-black shrink-0 text-sm">{plainLetterSub[1]}.</span>
          <h4 className="text-base font-bold text-foreground">{plainLetterSub[2]}</h4>
        </div>
      );
      continue;
    }

    // Roman sub-heading
    const plainRomanSub = trimmed.match(/^(i{1,3}|iv|vi{0,3}|ix|x)\.\s+([A-Z][A-Za-z0-9\s,()'-]{2,120})$/);
    if (plainRomanSub) {
      elements.push(
        <div key={i} className="flex items-start gap-2 mt-4 mb-2 pl-1">
          <span className="inline-flex items-center justify-center min-w-[28px] h-7 rounded-lg bg-primary/10 text-primary text-xs font-black px-1.5 border border-primary/20">
            {plainRomanSub[1]}
          </span>
          <h4 className="text-base font-bold text-foreground">{plainRomanSub[2]}</h4>
        </div>
      );
      continue;
    }

    // Paragraph text
    elements.push(
      <p key={i} className="text-[13.5px] text-muted-foreground leading-[1.95] py-0.5">
        {parseInlineBold(trimmed)}
      </p>
    );
  }

  return elements;
}

/** Splits sections into visual "topic cards" */
function groupSectionsIntoCards(sections: string[]) {
  const cards: { title: string | null; titleNum: string | null; content: string }[] = [];
  
  for (const section of sections) {
    const lines = section.split("\n");
    let currentCard: { title: string | null; titleNum: string | null; lines: string[] } | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Check if line is a major heading (numbered bold or plain numbered)
      const boldNumbered = trimmed.match(/^\*\*(\d+)\.\s+(.+?)\*\*$/);
      const plainNumbered = trimmed.match(/^(\d+)\.\s+([A-Z][A-Za-z\s,()'-]{10,120})$/);
      
      if (boldNumbered || plainNumbered) {
        // Save previous card
        if (currentCard && currentCard.lines.length > 0) {
          cards.push({ title: currentCard.title, titleNum: currentCard.titleNum, content: currentCard.lines.join("\n") });
        }
        const num = boldNumbered ? boldNumbered[1] : plainNumbered![1];
        const title = boldNumbered ? boldNumbered[2] : plainNumbered![2];
        currentCard = { title, titleNum: num, lines: [] };
        continue;
      }

      if (!currentCard) {
        currentCard = { title: null, titleNum: null, lines: [] };
      }
      currentCard.lines.push(line);
    }

    if (currentCard && currentCard.lines.length > 0) {
      cards.push({ title: currentCard.title, titleNum: currentCard.titleNum, content: currentCard.lines.join("\n") });
    }
  }

  return cards;
}

const isHtmlContent = (content: string) => {
  return /<[a-z][\s\S]*>/i.test(content) && (
    content.includes("<p>") || content.includes("<h1") || content.includes("<h2") || 
    content.includes("<img") || content.includes("<ul") || content.includes("<ol")
  );
};

/** Split HTML content at <h2> boundaries into individual section cards */
function splitHtmlIntoSections(html: string): { title: string | null; titleNum: string | null; body: string }[] {
  // Split on <h2> tags while capturing the tag content
  const parts = html.split(/(?=<h2[^>]*>)/i);
  const sections: { title: string | null; titleNum: string | null; body: string }[] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // Extract h2 title if present
    const h2Match = trimmed.match(/^<h2[^>]*>(.*?)<\/h2>/i);
    if (h2Match) {
      const titleText = h2Match[1].replace(/<[^>]+>/g, '').trim();
      const numMatch = titleText.match(/^(\d+)\.\s+(.+)/);
      const body = trimmed.replace(/^<h2[^>]*>.*?<\/h2>/i, '').trim();
      sections.push({
        title: numMatch ? numMatch[2] : titleText,
        titleNum: numMatch ? numMatch[1] : null,
        body,
      });
    } else {
      // Intro / learning outcomes section (before first h2)
      sections.push({ title: null, titleNum: null, body: trimmed });
    }
  }

  return sections;
}

const HtmlChapterContent = ({ content }: { content: string }) => {
  const sections = splitHtmlIntoSections(content);

  return (
    <div className="py-4 space-y-5">
      {sections.map((section, idx) => (
        <div
          key={idx}
          className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
          style={{
            animation: `slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${idx * 0.06}s forwards`,
            opacity: 0,
          }}
        >
          {section.title && (
            <div className="px-5 md:px-7 pt-5 pb-3 border-b border-border/40 bg-gradient-to-r from-primary/[0.04] to-transparent">
              <div className="flex items-center gap-3.5">
                {section.titleNum && (
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm font-black shadow-lg shadow-primary/25 shrink-0">
                    {section.titleNum}
                  </span>
                )}
                <h2 className="text-lg md:text-xl font-extrabold text-foreground tracking-tight leading-snug">
                  {section.title}
                </h2>
              </div>
            </div>
          )}
          <div className="px-5 md:px-7 py-5">
            <div
              className="chapter-html-content prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: section.body }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const FormattedChapterContent = ({ content }: { content: string }) => {
  // If content is already HTML (from rich editor), render it directly
  if (isHtmlContent(content)) {
    return <HtmlChapterContent content={content} />;
  }

  // Auto-convert plain text to professional HTML, then render via the HTML path
  const convertedHtml = plainTextToHtml(content);
  if (isHtmlContent(convertedHtml)) {
    return <HtmlChapterContent content={convertedHtml} />;
  }

  // Fallback: use the legacy plain-text parser (should rarely reach here)
  const processed = preprocessContent(content);
  const sections = processed.split(/\n---\n/);
  const cards = groupSectionsIntoCards(sections);

  return (
    <div className="py-4 space-y-5">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-card/80 backdrop-blur-sm border border-border/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
          style={{
            animation: `slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${idx * 0.06}s forwards`,
            opacity: 0,
          }}
        >
          {card.title && (
            <div className="px-5 md:px-7 pt-5 pb-3 border-b border-border/40 bg-gradient-to-r from-primary/[0.04] to-transparent">
              <div className="flex items-center gap-3.5">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm font-black shadow-lg shadow-primary/25 shrink-0">
                  {card.titleNum}
                </span>
                <h2 className="text-lg md:text-xl font-extrabold text-foreground tracking-tight leading-snug">
                  {card.title}
                </h2>
              </div>
            </div>
          )}
          <div className="px-5 md:px-7 py-4">
            {renderSection(card.content, idx)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FormattedChapterContent;
