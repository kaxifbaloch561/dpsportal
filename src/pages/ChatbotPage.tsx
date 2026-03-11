import { useState, useRef, useEffect, useCallback, memo } from "react";
import { useParams } from "react-router-dom";
import { useClassesData } from "@/hooks/useClassesData";
import { Send, Bot, User, Sparkles, Search, Copy, Check } from "lucide-react";
import schoolLogo from "@/assets/school-logo.png";
import PageShell from "@/components/PageShell";
import DashboardHeader from "@/components/DashboardHeader";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { supabase } from "@/integrations/supabase/client";

/* ── Types ── */
interface Message {
  role: "user" | "assistant";
  content: string;
}

interface QASuggestion {
  question: string;
  answer: string;
  chapter_number: number;
  chapter_title: string;
  exercise_type: string;
  question_number: number;
}

const formatExerciseType = (type: string): string => {
  const map: Record<string, string> = {
    short_question_answers: "Short Q/A",
    long_question_answers: "Long Q/A",
    fill_in_the_blanks: "Fill in Blanks",
    mcqs: "MCQ",
    multiple_choice: "MCQ",
    true_false: "True/False",
  };
  return map[type] || type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
};

/* ── Theme map ── */
const subjectGradients: Record<string, { bg: string; glow: string; accent: string }> = {
  math: { bg: "linear-gradient(135deg, hsl(235,78%,55%), hsl(280,70%,60%))", glow: "hsl(260,74%,58%)", accent: "hsl(280,70%,92%)" },
  science: { bg: "linear-gradient(135deg, hsl(160,70%,40%), hsl(190,80%,50%))", glow: "hsl(175,75%,45%)", accent: "hsl(180,70%,92%)" },
  english: { bg: "linear-gradient(135deg, hsl(340,75%,55%), hsl(20,90%,60%))", glow: "hsl(0,82%,58%)", accent: "hsl(350,70%,93%)" },
  hindi: { bg: "linear-gradient(135deg, hsl(30,90%,55%), hsl(45,95%,55%))", glow: "hsl(38,92%,55%)", accent: "hsl(40,90%,93%)" },
  "social-studies": { bg: "linear-gradient(135deg, hsl(200,75%,50%), hsl(235,78%,60%))", glow: "hsl(218,77%,55%)", accent: "hsl(220,75%,93%)" },
  computer: { bg: "linear-gradient(135deg, hsl(270,70%,55%), hsl(310,65%,55%))", glow: "hsl(290,68%,55%)", accent: "hsl(285,65%,93%)" },
  default: { bg: "linear-gradient(135deg, hsl(235,78%,55%), hsl(14,100%,65%))", glow: "hsl(235,78%,60%)", accent: "hsl(235,78%,93%)" },
};

/* ── Formatted answer renderer (memoized) ── */
const FormattedMessage = memo(({ content, glow }: { content: string; glow: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [content]);

  const sections = content.split(/\n\n---\n\n/);

  const renderSection = (text: string) => {
    const lines = text.split("\n").filter((l) => l.trim());
    const elements: JSX.Element[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      if (/^\*\*(.+)\*\*$/.test(trimmed)) {
        const match = trimmed.match(/^\*\*(.+)\*\*$/);
        elements.push(
          <h4 key={idx} className="font-bold text-foreground mt-3 mb-1.5 text-[0.84rem] sm:text-[0.94rem] tracking-tight">
            {match![1]}
          </h4>
        );
        return;
      }

      if (/^\([a-z]\)\s+/i.test(trimmed)) {
        const headingMatch = trimmed.match(/^(\([a-z]\))\s+(.+)/i);
        if (headingMatch) {
          const colonIdx = headingMatch[2].indexOf(":");
          if (colonIdx > 0 && colonIdx < 60) {
            const title = headingMatch[2].substring(0, colonIdx);
            const rest = headingMatch[2].substring(colonIdx + 1).trim();
            elements.push(
              <div key={idx} className="mt-3 mb-1">
                <span className="font-bold text-foreground" style={{ color: glow }}>{headingMatch[1]}</span>{" "}
                <span className="font-bold text-foreground">{title}:</span>
                {rest && <span className="text-muted-foreground"> {rest}</span>}
              </div>
            );
          } else {
            elements.push(
              <div key={idx} className="mt-3 mb-1">
                <span className="font-bold" style={{ color: glow }}>{headingMatch[1]}</span>{" "}
                <span className="font-semibold text-foreground">{headingMatch[2]}</span>
              </div>
            );
          }
          return;
        }
      }

      if (/^(\d+[-.)]\s|[ivx]+[.)]\s)/i.test(trimmed)) {
        const numMatch = trimmed.match(/^(\d+[-.)]\s*|[ivx]+[.)]\s*)(.*)/i);
        if (numMatch) {
          const label = numMatch[1].trim();
          const body = numMatch[2];
          const colonIdx = body.indexOf(":");
          if (colonIdx > 0 && colonIdx < 80) {
            const boldPart = body.substring(0, colonIdx);
            const restPart = body.substring(colonIdx + 1).trim();
            elements.push(
              <div key={idx} className="flex gap-1.5 sm:gap-2.5 pl-1 sm:pl-2 py-0.5">
                <span className="font-bold shrink-0 min-w-[1.1rem] sm:min-w-[1.5rem] text-right" style={{ color: glow }}>{label}</span>
                <span className="text-foreground leading-[1.65] sm:leading-[1.8]">
                  <strong>{boldPart}:</strong> {restPart}
                </span>
              </div>
            );
          } else {
            elements.push(
              <div key={idx} className="flex gap-1.5 sm:gap-2.5 pl-1 sm:pl-2 py-0.5">
                <span className="font-bold shrink-0 min-w-[1.1rem] sm:min-w-[1.5rem] text-right" style={{ color: glow }}>{label}</span>
                <span className="text-foreground leading-[1.65] sm:leading-[1.8]">{body}</span>
              </div>
            );
          }
          return;
        }
      }

      if (/^[-–•]\s/.test(trimmed)) {
        elements.push(
          <div key={idx} className="flex gap-1.5 pl-1.5 sm:pl-3 py-0.5">
            <span className="shrink-0 mt-[0.6em]" style={{ color: glow }}>•</span>
            <span className="text-foreground leading-[1.65] sm:leading-[1.8]">{trimmed.replace(/^[-–•]\s*/, "")}</span>
          </div>
        );
        return;
      }

      if (/^[A-Z][^:]{2,50}:\s/.test(trimmed)) {
        const colonIdx = trimmed.indexOf(":");
        const title = trimmed.substring(0, colonIdx);
        const rest = trimmed.substring(colonIdx + 1).trim();
        elements.push(
          <p key={idx} className="leading-[1.65] sm:leading-[1.8] py-0.5">
            <strong className="text-foreground">{title}:</strong>{" "}
            <span className="text-foreground">{rest}</span>
          </p>
        );
        return;
      }

      elements.push(
        <p key={idx} className="leading-[1.65] sm:leading-[1.8] text-foreground py-0.5">{trimmed}</p>
      );
    });
    return elements;
  };

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute -top-1 -right-1 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-accent/60 bg-card border border-border/30 shadow-sm"
        title="Copy answer"
      >
        {copied ? <Check size={11} className="text-green-500" /> : <Copy size={11} className="text-muted-foreground" />}
      </button>
      <div className="space-y-0.5 text-[0.8rem] sm:text-[0.92rem]">
        {sections.map((section, sIdx) => (
          <div key={sIdx}>
            {sIdx > 0 && <hr className="my-3 border-border/30" />}
            {renderSection(section)}
          </div>
        ))}
      </div>
    </div>
  );
});

FormattedMessage.displayName = "FormattedMessage";

/* ── Single chat bubble (memoized) ── */
const ChatBubble = memo(({ msg, theme }: { msg: Message; theme: typeof subjectGradients.default }) => {
  const isUser = msg.role === "user";

  return (
    <div
      className={`flex gap-2 sm:gap-3 ${isUser ? "justify-end" : "justify-start"}`}
      style={{ animation: `${isUser ? "slideUp" : "popIn"} 0.18s ease-out forwards` }}
    >
      {!isUser && (
        <div className="shrink-0 mt-1">
          <div
            className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: theme.bg, boxShadow: `0 4px 14px -4px ${theme.glow}44` }}
          >
            <Bot size={13} className="sm:w-4 sm:h-4 text-white" />
          </div>
        </div>
      )}

      <div
        className={`max-w-[85%] sm:max-w-[78%] px-3 sm:px-5 py-2.5 sm:py-3.5 text-[12.5px] sm:text-[13.5px] ${
          isUser
            ? "rounded-2xl rounded-br-md text-white whitespace-pre-wrap leading-relaxed"
            : "bg-card text-foreground rounded-2xl rounded-bl-md border border-border/30"
        }`}
        style={
          isUser
            ? { background: theme.bg, boxShadow: `0 4px 20px -6px ${theme.glow}35` }
            : { boxShadow: "0 2px 10px -4px hsl(0 0% 0% / 0.05)" }
        }
      >
        {!isUser ? <FormattedMessage content={msg.content} glow={theme.glow} /> : msg.content}
      </div>

      {isUser && (
        <div className="shrink-0 mt-1">
          <div
            className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border-2"
            style={{ background: theme.accent, borderColor: `${theme.glow}25` }}
          >
            <User size={13} className="sm:w-4 sm:h-4" style={{ color: theme.glow }} />
          </div>
        </div>
      )}
    </div>
  );
});

ChatBubble.displayName = "ChatBubble";

/* ── Typing indicator ── */
const TypingIndicator = memo(({ theme }: { theme: typeof subjectGradients.default }) => (
  <div className="flex gap-2 sm:gap-3 justify-start" style={{ animation: "popIn 0.18s ease-out forwards" }}>
    <div
      className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg mt-1"
      style={{ background: theme.bg, boxShadow: `0 4px 14px -4px ${theme.glow}44` }}
    >
      <Bot size={13} className="sm:w-4 sm:h-4 text-white" />
    </div>
    <div
      className="bg-card border border-border/30 rounded-2xl rounded-bl-md px-4 py-2.5 sm:py-3.5"
      style={{ boxShadow: "0 2px 10px -4px hsl(0 0% 0% / 0.05)" }}
    >
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[0, 1, 2].map((d) => (
            <span
              key={d}
              className="w-[6px] h-[6px] rounded-full"
              style={{
                background: theme.glow,
                opacity: 0.7,
                animation: `float 0.8s ease-in-out infinite ${d * 0.12}s`,
              }}
            />
          ))}
        </div>
        <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium">Searching...</span>
      </div>
    </div>
  </div>
));

TypingIndicator.displayName = "TypingIndicator";

/* ── Empty state - compact, no fake suggestions ── */
const EmptyState = memo(({ theme, subjectName }: {
  theme: typeof subjectGradients.default;
  subjectName: string;
}) => (
  <div className="flex flex-col items-center justify-center text-center py-8 sm:py-14" style={{ animation: "cardEntrance 0.2s ease-out forwards" }}>
    <div className="relative mb-3 sm:mb-5" style={{ animation: "float 4s ease-in-out infinite" }}>
      <div className="absolute inset-0 rounded-full blur-3xl opacity-15" style={{ background: theme.bg, transform: "scale(2)" }} />
      <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center overflow-hidden bg-card border border-border/30 shadow-xl">
        <img src={schoolLogo} alt="DPS" loading="eager" decoding="async" className="w-12 h-12 sm:w-20 sm:h-20 object-contain" />
      </div>
      <div className="absolute -top-1 -right-1">
        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center shadow-md" style={{ background: theme.accent }}>
          <Sparkles size={10} className="sm:w-[11px] sm:h-[11px]" style={{ color: theme.glow }} />
        </div>
      </div>
    </div>

    <h2 className="text-sm sm:text-base font-bold text-foreground mb-0.5">
      {subjectName} Assistant
    </h2>
    <p className="text-[11px] sm:text-xs text-muted-foreground max-w-[220px] sm:max-w-xs px-4">
      Type your question below to get chapter-wise Q&A answers from the syllabus.
    </p>
  </div>
));

EmptyState.displayName = "EmptyState";

/* ── Main chatbot page ── */
const ChatbotPage = () => {
  const { classId, subjectId } = useParams();
  const { data: classesData = [] } = useClassesData();
  const cls = classesData.find((c) => c.id === Number(classId));
  const subject = cls?.subjects.find((s) => s.id === subjectId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<QASuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const theme = subjectGradients[subject?.id || "default"] || subjectGradients.default;
  const classNum = Number(classId);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const searchQuestions = useCallback(async (query: string) => {
    if (query.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const { data } = await supabase.rpc("search_chapter_qa", {
        p_class_id: classNum,
        p_subject_id: subjectId!,
        p_query: query.trim(),
        p_limit: 10,
      });
      if (data && data.length > 0) {
        setSuggestions(data);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (err) {
      console.error("Search error:", err);
    }
  }, [classNum, subjectId]);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchQuestions(value), 150);
  }, [searchQuestions]);

  const handleSelectSuggestion = useCallback((qa: QASuggestion) => {
    setShowSuggestions(false);
    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: qa.question },
      { role: "assistant", content: qa.answer },
    ]);
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setShowSuggestions(false);
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    try {
      const { data: rpcResults } = await supabase.rpc("search_chapter_qa", {
        p_class_id: classNum,
        p_subject_id: subjectId!,
        p_query: text,
        p_limit: 5,
      });
      const results: QASuggestion[] = rpcResults || [];
      if (results.length > 0) {
        const answer = results.map((r) => {
          const chLabel = `Ch.${r.chapter_number}`;
          const typeLabel = formatExerciseType(r.exercise_type);
          return `**${chLabel} — ${typeLabel} — Q.${r.question_number}**\n${r.answer}`;
        }).join("\n\n---\n\n");
        setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, this question is not available in our exercises database yet. Please try a different question from your syllabus exercises." },
        ]);
      }
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, classNum, subjectId]);

  if (!cls || !subject) return <div className="p-10 text-center text-muted-foreground">Not found</div>;

  return (
    <PageShell>
      <DashboardHeader showBack subtitle={`${cls.name} — ${subject.name} — Chatbot`} />
      <BreadcrumbNav crumbs={[
        { label: "Dashboard", path: "/dashboard" },
        { label: cls.name, path: `/class/${cls.id}` },
        { label: subject.name, path: `/class/${cls.id}/subject/${subject.id}` },
        { label: "Chatbot" },
      ]} />

      {/* Chat area - fills remaining space between header/breadcrumb and footer */}
      <div className="flex-1 flex flex-col overflow-hidden relative" style={{ minHeight: 0 }}>
        {/* Ambient blobs - desktop only */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
          <div
            className="absolute w-[450px] h-[450px] rounded-full opacity-[0.035] blur-[100px] -top-40 -right-40"
            style={{ background: theme.bg }}
          />
          <div
            className="absolute w-[350px] h-[350px] rounded-full opacity-[0.025] blur-[80px] -bottom-20 -left-20"
            style={{ background: theme.bg }}
          />
        </div>

        {/* Scrollable chat messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto overscroll-contain px-2.5 sm:px-6 py-2 sm:py-4 relative z-10"
          style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y", willChange: "scroll-position" }}
        >
          <div className="max-w-2xl mx-auto space-y-2.5 sm:space-y-4">
            {messages.length === 0 && (
              <EmptyState theme={theme} subjectName={subject.name} />
            )}

            {messages.map((msg, i) => (
              <ChatBubble key={i} msg={msg} theme={theme} />
            ))}

            {isLoading && <TypingIndicator theme={theme} />}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input bar - sticky at bottom */}
        <div className="relative z-10 px-2.5 sm:px-6 pb-2 sm:pb-3 pt-1">
          <div className="max-w-2xl mx-auto relative" ref={suggestionsRef}>
            {/* Autocomplete dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                className="absolute bottom-full mb-1.5 left-0 right-0 bg-card border border-border/50 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden z-50"
                style={{ animation: "cardEntrance 0.12s ease-out forwards", boxShadow: `0 -6px 32px -8px ${theme.glow}10` }}
              >
                <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/30">
                  <Search size={11} style={{ color: theme.glow }} />
                  <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground">
                    {suggestions.length} match{suggestions.length > 1 ? "es" : ""}
                  </span>
                </div>
                <div className="max-h-36 sm:max-h-56 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: "touch" }}>
                  {suggestions.map((qa, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSuggestion(qa)}
                      className="w-full text-left px-3 py-2 sm:py-2.5 hover:bg-accent/40 transition-colors duration-100 border-b border-border/15 last:border-b-0 group active:bg-accent/60"
                    >
                      <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mb-1">
                        {qa.chapter_number > 0 && (
                          <span 
                            className="px-1.5 py-0.5 rounded-md text-[8px] sm:text-[9px] font-bold text-white"
                            style={{ background: theme.bg }}
                          >
                            Ch {qa.chapter_number}
                          </span>
                        )}
                        {qa.exercise_type && qa.exercise_type !== 'Q&A' && (
                          <span 
                            className="px-1.5 py-0.5 rounded-md text-[8px] sm:text-[9px] font-semibold border"
                            style={{ 
                              borderColor: `${theme.glow}30`,
                              color: theme.glow,
                              background: `${theme.glow}08`
                            }}
                          >
                            {formatExerciseType(qa.exercise_type)}
                          </span>
                        )}
                        {qa.question_number > 0 && (
                          <span className="text-[8px] sm:text-[9px] font-medium text-muted-foreground">
                            Q{qa.question_number}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-[13px] font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {qa.question}
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                        {qa.answer.substring(0, 80)}...
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="relative flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border bg-card transition-all duration-200"
              style={{
                borderColor: isFocused ? `${theme.glow}35` : "hsl(var(--border) / 0.5)",
                boxShadow: isFocused
                  ? `0 4px 24px -6px ${theme.glow}20, 0 0 0 1px ${theme.glow}10`
                  : "0 2px 12px -4px hsl(0 0% 0% / 0.05)",
              }}
            >
              <div
                className="absolute top-0 left-4 right-4 h-[1px] rounded-full transition-opacity duration-200"
                style={{ background: theme.bg, opacity: isFocused ? 0.7 : 0 }}
              />
              <input
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={`Ask about ${subject.name}...`}
                className="flex-1 px-2.5 sm:px-4 py-2 sm:py-2.5 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-[12.5px] sm:text-sm font-medium"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl text-white flex items-center justify-center transition-all duration-150 disabled:opacity-25 disabled:scale-95 hover:scale-105 active:scale-95 shrink-0"
                style={{
                  background: !isLoading && input.trim() ? theme.bg : `${theme.glow}30`,
                  boxShadow: !isLoading && input.trim() ? `0 4px 14px -4px ${theme.glow}40` : "none",
                }}
              >
                <Send size={14} className="sm:w-[15px] sm:h-[15px]" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default ChatbotPage;
