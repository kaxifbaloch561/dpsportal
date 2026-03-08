import { useState, useRef, useEffect, useCallback, memo } from "react";
import { useParams } from "react-router-dom";
import { useClassesData } from "@/hooks/useClassesData";
import { Send, Bot, User, Sparkles, Zap, BookOpen, HelpCircle, Search, Copy, Check } from "lucide-react";
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
}

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
          <h4 key={idx} className="font-bold text-foreground mt-3 mb-1.5 text-[0.875rem] sm:text-[0.94rem] tracking-tight">
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
              <div key={idx} className="flex gap-2 sm:gap-2.5 pl-1 sm:pl-2 py-0.5">
                <span className="font-bold shrink-0 min-w-[1.2rem] sm:min-w-[1.5rem] text-right" style={{ color: glow }}>{label}</span>
                <span className="text-foreground leading-[1.7] sm:leading-[1.8]">
                  <strong>{boldPart}:</strong> {restPart}
                </span>
              </div>
            );
          } else {
            elements.push(
              <div key={idx} className="flex gap-2 sm:gap-2.5 pl-1 sm:pl-2 py-0.5">
                <span className="font-bold shrink-0 min-w-[1.2rem] sm:min-w-[1.5rem] text-right" style={{ color: glow }}>{label}</span>
                <span className="text-foreground leading-[1.7] sm:leading-[1.8]">{body}</span>
              </div>
            );
          }
          return;
        }
      }

      if (/^[-–•]\s/.test(trimmed)) {
        elements.push(
          <div key={idx} className="flex gap-2 pl-2 sm:pl-3 py-0.5">
            <span className="shrink-0 mt-[0.6em]" style={{ color: glow }}>•</span>
            <span className="text-foreground leading-[1.7] sm:leading-[1.8]">{trimmed.replace(/^[-–•]\s*/, "")}</span>
          </div>
        );
        return;
      }

      if (/^[A-Z][^:]{2,50}:\s/.test(trimmed)) {
        const colonIdx = trimmed.indexOf(":");
        const title = trimmed.substring(0, colonIdx);
        const rest = trimmed.substring(colonIdx + 1).trim();
        elements.push(
          <p key={idx} className="leading-[1.7] sm:leading-[1.8] py-0.5">
            <strong className="text-foreground">{title}:</strong>{" "}
            <span className="text-foreground">{rest}</span>
          </p>
        );
        return;
      }

      elements.push(
        <p key={idx} className="leading-[1.7] sm:leading-[1.8] text-foreground py-0.5">{trimmed}</p>
      );
    });
    return elements;
  };

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute -top-1 -right-1 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-accent/60 bg-card/80 backdrop-blur-sm border border-border/30 shadow-sm"
        title="Copy answer"
      >
        {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} className="text-muted-foreground" />}
      </button>
      <div className="space-y-0.5 text-[0.84rem] sm:text-[0.92rem]">
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
const ChatBubble = memo(({ msg, theme, index }: { msg: Message; theme: typeof subjectGradients.default; index: number }) => {
  const isUser = msg.role === "user";

  return (
    <div
      className={`flex gap-2.5 sm:gap-3 ${isUser ? "justify-end" : "justify-start"}`}
      style={{ animation: `${isUser ? "slideUp" : "popIn"} 0.22s ease-out forwards` }}
    >
      {!isUser && (
        <div className="relative shrink-0 mt-1">
          <div
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: theme.bg, boxShadow: `0 4px 14px -4px ${theme.glow}44` }}
          >
            <Bot size={14} className="sm:w-4 sm:h-4 text-white" />
          </div>
        </div>
      )}

      <div
        className={`max-w-[82%] sm:max-w-[78%] px-3.5 sm:px-5 py-3 sm:py-3.5 text-[13px] sm:text-[13.5px] ${
          isUser
            ? "rounded-2xl rounded-br-md text-white whitespace-pre-wrap leading-relaxed"
            : "bg-card/95 backdrop-blur-sm text-foreground rounded-2xl rounded-bl-md border border-border/30"
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
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border-2"
            style={{ background: theme.accent, borderColor: `${theme.glow}25` }}
          >
            <User size={14} className="sm:w-4 sm:h-4" style={{ color: theme.glow }} />
          </div>
        </div>
      )}
    </div>
  );
});

ChatBubble.displayName = "ChatBubble";

/* ── Typing indicator ── */
const TypingIndicator = memo(({ theme }: { theme: typeof subjectGradients.default }) => (
  <div className="flex gap-2.5 sm:gap-3 justify-start" style={{ animation: "popIn 0.2s ease-out forwards" }}>
    <div
      className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg mt-1"
      style={{ background: theme.bg, boxShadow: `0 4px 14px -4px ${theme.glow}44` }}
    >
      <Bot size={14} className="sm:w-4 sm:h-4 text-white" />
    </div>
    <div
      className="bg-card/95 backdrop-blur-sm border border-border/30 rounded-2xl rounded-bl-md px-4 sm:px-5 py-3 sm:py-3.5"
      style={{ boxShadow: "0 2px 10px -4px hsl(0 0% 0% / 0.05)" }}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex gap-1">
          {[0, 1, 2].map((d) => (
            <span
              key={d}
              className="w-[7px] h-[7px] rounded-full"
              style={{
                background: theme.glow,
                opacity: 0.7,
                animation: `float 0.8s ease-in-out infinite ${d * 0.12}s`,
              }}
            />
          ))}
        </div>
        <span className="text-[11px] text-muted-foreground font-medium">Searching...</span>
      </div>
    </div>
  </div>
));

TypingIndicator.displayName = "TypingIndicator";

/* ── Empty state ── */
const EmptyState = memo(({ theme, subjectName, onSuggestionClick }: {
  theme: typeof subjectGradients.default;
  subjectName: string;
  onSuggestionClick: (text: string) => void;
}) => {
  const quickSuggestions = [
    { icon: BookOpen, text: `Explain a key concept in ${subjectName}` },
    { icon: HelpCircle, text: "Summarize the latest chapter" },
    { icon: Zap, text: "Help me with practice questions" },
  ];

  return (
    <div className="flex flex-col items-center justify-center text-center py-6 sm:py-16" style={{ animation: "cardEntrance 0.25s ease-out forwards" }}>
      {/* Logo with glow */}
      <div className="relative mb-4 sm:mb-6" style={{ animation: "float 4s ease-in-out infinite" }}>
        <div className="absolute inset-0 rounded-full blur-3xl opacity-15" style={{ background: theme.bg, transform: "scale(2)" }} />
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center overflow-hidden bg-card/80 backdrop-blur-sm border border-border/30 shadow-xl">
          <img src={schoolLogo} alt="DPS" loading="eager" decoding="async" className="w-20 h-20 sm:w-28 sm:h-28 object-contain" />
        </div>
        <div className="absolute -top-1.5 -right-1.5">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center shadow-md" style={{ background: theme.accent }}>
            <Sparkles size={11} style={{ color: theme.glow }} />
          </div>
        </div>
      </div>

      <h2 className="text-sm sm:text-base font-bold text-foreground mb-0.5">
        {subjectName} Assistant
      </h2>
      <p className="text-xs text-muted-foreground max-w-xs mb-5 sm:mb-7 px-4">
        Get chapter-wise Q&A from the curriculum — type a question or pick a suggestion below.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full max-w-lg px-3 sm:px-0">
        {quickSuggestions.map((s, idx) => {
          const Icon = s.icon;
          return (
            <button
              key={idx}
              onClick={() => onSuggestionClick(s.text)}
              className="group relative flex items-center sm:flex-col gap-3 sm:gap-2 p-3 sm:p-4 rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm text-left sm:text-center hover:border-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] overflow-hidden"
              style={{ animation: `cardEntrance 0.2s ease-out ${0.08 + idx * 0.05}s both` }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `radial-gradient(circle at 50% 0%, ${theme.glow}08, transparent 70%)` }}
              />
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center relative z-10 shrink-0" style={{ background: theme.accent }}>
                <Icon size={15} style={{ color: theme.glow }} />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors relative z-10 leading-snug">
                {s.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

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
  const bottomRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const theme = subjectGradients[subject?.id || "default"] || subjectGradients.default;
  const classNum = Number(classId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const { data } = await supabase.rpc("search_chapter_qa", {
        p_class_id: classNum,
        p_subject_id: subjectId!,
        p_query: query.trim(),
        p_limit: 8,
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
    debounceRef.current = setTimeout(() => searchQuestions(value), 180);
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
      let results: QASuggestion[] = rpcResults || [];
      if (results.length === 0) {
        const keywords = text.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter((w) => w.length > 2);
        const searchTerms = keywords.join(" & ");
        if (searchTerms) {
          const { data: ftsData } = await supabase
            .from("chapter_qa")
            .select("question, answer")
            .eq("class_id", classNum)
            .eq("subject_id", subjectId!)
            .textSearch("search_vector", searchTerms, { type: "plain" })
            .limit(3);
          results = ftsData || [];
        }
      }
      if (results.length > 0) {
        const answer = results.map((r) => r.answer).join("\n\n---\n\n");
        setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, this question is not available in our database yet. Please try a different question from your syllabus." },
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

      <div className="flex-1 flex flex-col overflow-hidden relative">
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

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4 scroll-smooth relative z-10">
          <div className="max-w-2xl mx-auto space-y-3 sm:space-y-4">
            {messages.length === 0 && (
              <EmptyState theme={theme} subjectName={subject.name} onSuggestionClick={handleInputChange} />
            )}

            {messages.map((msg, i) => (
              <ChatBubble key={i} msg={msg} theme={theme} index={i} />
            ))}

            {isLoading && <TypingIndicator theme={theme} />}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input bar */}
        <div className="relative z-10 px-3 sm:px-6 pb-3 sm:pb-4 pt-1.5">
          <div className="max-w-2xl mx-auto relative" ref={suggestionsRef}>
            {/* Autocomplete dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                className="absolute bottom-full mb-2 left-0 right-0 bg-card/98 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden z-50"
                style={{ animation: "cardEntrance 0.12s ease-out forwards", boxShadow: `0 -6px 32px -8px ${theme.glow}10` }}
              >
                <div className="flex items-center gap-2 px-3.5 py-2 border-b border-border/30">
                  <Search size={12} style={{ color: theme.glow }} />
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {suggestions.length} match{suggestions.length > 1 ? "es" : ""} found
                  </span>
                </div>
                <div className="max-h-44 sm:max-h-56 overflow-y-auto overscroll-contain">
                  {suggestions.map((qa, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSuggestion(qa)}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-accent/40 transition-colors duration-100 border-b border-border/15 last:border-b-0 group active:bg-accent/60"
                    >
                      <p className="text-xs sm:text-[13px] font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {qa.question}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                        {qa.answer.substring(0, 80)}...
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="relative flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl border bg-card/85 backdrop-blur-xl transition-all duration-300"
              style={{
                borderColor: isFocused ? `${theme.glow}35` : "hsl(var(--border) / 0.5)",
                boxShadow: isFocused
                  ? `0 6px 32px -8px ${theme.glow}20, 0 0 0 1px ${theme.glow}10`
                  : "0 2px 16px -6px hsl(0 0% 0% / 0.05)",
              }}
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-5 right-5 h-[1.5px] rounded-full transition-opacity duration-300"
                style={{ background: theme.bg, opacity: isFocused ? 0.8 : 0 }}
              />
              <input
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={`Ask about ${subject.name}...`}
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-[13px] sm:text-sm font-medium"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-white flex items-center justify-center transition-all duration-200 disabled:opacity-25 disabled:scale-95 hover:scale-105 active:scale-95 shrink-0"
                style={{
                  background: !isLoading && input.trim() ? theme.bg : `${theme.glow}30`,
                  boxShadow: !isLoading && input.trim() ? `0 4px 16px -4px ${theme.glow}40` : "none",
                }}
              >
                <Send size={15} />
              </button>
            </form>
            <p className="text-center text-[9px] text-muted-foreground/40 mt-1.5 font-medium">
              {subject.name} Curriculum Reference
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default ChatbotPage;
