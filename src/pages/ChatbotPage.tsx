import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { classesData } from "@/data/classesData";
import { Send, Bot, User, Sparkles, Zap, BookOpen, HelpCircle, Search } from "lucide-react";
import schoolLogo from "@/assets/school-logo.png";
import PageShell from "@/components/PageShell";
import DashboardHeader from "@/components/DashboardHeader";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface QASuggestion {
  question: string;
  answer: string;
}

const subjectGradients: Record<string, { bg: string; glow: string; accent: string }> = {
  math: { bg: "linear-gradient(135deg, hsl(235, 78%, 55%), hsl(280, 70%, 60%))", glow: "hsl(260, 74%, 58%)", accent: "hsl(280, 70%, 92%)" },
  science: { bg: "linear-gradient(135deg, hsl(160, 70%, 40%), hsl(190, 80%, 50%))", glow: "hsl(175, 75%, 45%)", accent: "hsl(180, 70%, 92%)" },
  english: { bg: "linear-gradient(135deg, hsl(340, 75%, 55%), hsl(20, 90%, 60%))", glow: "hsl(0, 82%, 58%)", accent: "hsl(350, 70%, 93%)" },
  hindi: { bg: "linear-gradient(135deg, hsl(30, 90%, 55%), hsl(45, 95%, 55%))", glow: "hsl(38, 92%, 55%)", accent: "hsl(40, 90%, 93%)" },
  "social-studies": { bg: "linear-gradient(135deg, hsl(200, 75%, 50%), hsl(235, 78%, 60%))", glow: "hsl(218, 77%, 55%)", accent: "hsl(220, 75%, 93%)" },
  computer: { bg: "linear-gradient(135deg, hsl(270, 70%, 55%), hsl(310, 65%, 55%))", glow: "hsl(290, 68%, 55%)", accent: "hsl(285, 65%, 93%)" },
  default: { bg: "linear-gradient(135deg, hsl(235, 78%, 55%), hsl(14, 100%, 65%))", glow: "hsl(235, 78%, 60%)", accent: "hsl(235, 78%, 93%)" },
};

const ChatbotPage = () => {
  const { classId, subjectId } = useParams();
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const theme = subjectGradients[subject?.id || "default"] || subjectGradients.default;
  const classNum = Number(classId);

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

  // Real-time search as user types
  const searchQuestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const { data } = await supabase
        .from("chapter_qa")
        .select("question, answer")
        .eq("class_id", classNum)
        .eq("subject_id", subjectId!)
        .ilike("question", `%${query.trim()}%`)
        .limit(8);

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

  const handleInputChange = (value: string) => {
    setInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchQuestions(value), 150);
  };

  // Select a suggestion
  const handleSelectSuggestion = (qa: QASuggestion) => {
    setShowSuggestions(false);
    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: qa.question },
      { role: "assistant", content: qa.answer },
    ]);
  };

  // Send question - search database directly
  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setShowSuggestions(false);
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Try ILIKE search
      const keywords = text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 2);

      let results: QASuggestion[] = [];

      // Try full text search first
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

      // Fallback: ILIKE keyword search
      if (results.length === 0) {
        for (const keyword of keywords) {
          const { data: ilikeData } = await supabase
            .from("chapter_qa")
            .select("question, answer")
            .eq("class_id", classNum)
            .eq("subject_id", subjectId!)
            .ilike("question", `%${keyword}%`)
            .limit(3);
          if (ilikeData && ilikeData.length > 0) {
            results = ilikeData;
            break;
          }
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
  };

  const quickSuggestions = [
    { icon: BookOpen, text: `Explain a key concept in ${subject.name}` },
    { icon: HelpCircle, text: "Summarize the latest chapter" },
    { icon: Zap, text: "Help me with practice questions" },
  ];

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
        {/* Ambient background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute w-[500px] h-[500px] rounded-full opacity-[0.04] blur-[100px] -top-40 -right-40"
            style={{ background: theme.bg, animation: "floatBlob 20s ease-in-out infinite" }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full opacity-[0.03] blur-[80px] -bottom-20 -left-20"
            style={{ background: theme.bg, animation: "floatBlob 25s ease-in-out infinite reverse" }}
          />
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 scroll-smooth relative z-10">
          <div className="max-w-3xl mx-auto space-y-5">
            {messages.length === 0 && (
              <div
                className="flex flex-col items-center justify-center text-center py-12 sm:py-20"
                style={{ animation: "cardEntrance 0.3s ease-out forwards" }}
              >
                <div style={{ animation: "float 3s ease-in-out infinite" }}>
                  <div
                    className="absolute inset-0 rounded-[32px] blur-2xl opacity-30"
                    style={{ background: theme.bg, transform: "scale(1.5)" }}
                  />
                  <div className="relative w-96 h-96 rounded-[32px] flex items-center justify-center overflow-hidden">
                    <img src={schoolLogo} alt="School Logo" loading="eager" decoding="async" className="w-80 h-80 object-contain relative z-10" />
                    <div
                      className="absolute inset-0 opacity-40"
                      style={{
                        background: "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)",
                        animation: "shimmer 3s ease-in-out infinite",
                      }}
                    />
                  </div>
                  <div className="absolute -inset-4 rounded-[38px]" style={{ border: `2px solid ${theme.glow}22`, animation: "borderGlow 3s ease-in-out infinite" }} />
                  <div className="absolute -inset-8 rounded-[44px]" style={{ border: `1px solid ${theme.glow}11`, animation: "borderGlow 3s ease-in-out infinite 1s" }} />
                  <div className="absolute -top-3 -right-3" style={{ animation: "float 2s ease-in-out infinite 0.2s" }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: theme.accent }}>
                      <Sparkles size={14} style={{ color: theme.glow }} />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -left-4" style={{ animation: "float 2.5s ease-in-out infinite 0.7s" }}>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: theme.accent }}>
                      <Zap size={12} style={{ color: theme.glow }} />
                    </div>
                  </div>
                </div>

                <p className="text-base font-semibold text-foreground mb-1">
                  {subject.name} — Teacher Assistant
                </p>
                <p className="text-sm text-muted-foreground max-w-sm mb-8">
                  Your teaching companion for {subject.name}. Get chapter-wise Q&A from the curriculum!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl">
                  {quickSuggestions.map((s, idx) => {
                    const Icon = s.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleInputChange(s.text)}
                        className="group relative flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm text-center hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg overflow-hidden"
                        style={{ animation: `cardEntrance 0.25s ease-out ${0.1 + idx * 0.06}s both` }}
                      >
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{ background: `radial-gradient(circle at 50% 0%, ${theme.glow}12, transparent 70%)` }}
                        />
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center relative z-10" style={{ background: theme.accent }}>
                          <Icon size={18} style={{ color: theme.glow }} />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors relative z-10 leading-snug">
                          {s.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                style={{ animation: `${msg.role === "user" ? "slideUp" : "popIn"} 0.25s ease-out forwards` }}
              >
                {msg.role === "assistant" && (
                  <div className="relative shrink-0 mt-1">
                    <div
                      className="w-10 h-10 rounded-[14px] flex items-center justify-center shadow-lg"
                      style={{ background: theme.bg, boxShadow: `0 4px 16px -4px ${theme.glow}44` }}
                    >
                      <Bot size={18} className="text-white" />
                    </div>
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-[20px] px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "rounded-br-lg text-white"
                      : "bg-card/90 backdrop-blur-sm text-foreground rounded-bl-lg border border-border/40"
                  }`}
                  style={
                    msg.role === "user"
                      ? { background: theme.bg, boxShadow: `0 6px 24px -6px ${theme.glow}40` }
                      : { boxShadow: `0 2px 12px -4px hsl(0 0% 0% / 0.06)` }
                  }
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="shrink-0 mt-1">
                    <div
                      className="w-10 h-10 rounded-[14px] flex items-center justify-center border-2"
                      style={{ background: theme.accent, borderColor: `${theme.glow}30` }}
                    >
                      <User size={18} style={{ color: theme.glow }} />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start" style={{ animation: "popIn 0.2s ease-out forwards" }}>
                <div
                  className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 shadow-lg mt-1"
                  style={{ background: theme.bg, boxShadow: `0 4px 16px -4px ${theme.glow}44` }}
                >
                  <Bot size={18} className="text-white" />
                </div>
                <div
                  className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-[20px] rounded-bl-lg px-5 py-4"
                  style={{ boxShadow: `0 2px 12px -4px hsl(0 0% 0% / 0.06)` }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((d) => (
                        <span
                          key={d}
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: theme.bg, animation: `float 1s ease-in-out infinite ${d * 0.15}s` }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground ml-1 font-medium">Searching...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input Bar */}
        <div className="relative z-10 px-4 sm:px-8 pb-5 pt-2">
          <div className="max-w-3xl mx-auto relative" ref={suggestionsRef}>
            {/* Autocomplete suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                className="absolute bottom-full mb-2 left-0 right-0 bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl overflow-hidden z-50"
                style={{ animation: "cardEntrance 0.15s ease-out forwards", boxShadow: `0 -8px 40px -12px ${theme.glow}15` }}
              >
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/40">
                  <Search size={14} style={{ color: theme.glow }} />
                  <span className="text-xs font-semibold text-muted-foreground">
                    {suggestions.length} matching question{suggestions.length > 1 ? "s" : ""} found
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {suggestions.map((qa, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSuggestion(qa)}
                      className="w-full text-left px-4 py-3 hover:bg-accent/50 transition-colors duration-150 border-b border-border/20 last:border-b-0 group"
                    >
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {qa.question}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {qa.answer.substring(0, 100)}...
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="relative flex items-center gap-3 p-2 rounded-[22px] border bg-card/80 backdrop-blur-xl transition-all duration-400"
              style={{
                borderColor: isFocused ? `${theme.glow}40` : "hsl(var(--border) / 0.6)",
                boxShadow: isFocused
                  ? `0 8px 40px -12px ${theme.glow}25, 0 0 0 1px ${theme.glow}15`
                  : "0 4px 20px -8px hsl(0 0% 0% / 0.06)",
              }}
            >
              <div
                className="absolute top-0 left-6 right-6 h-[2px] rounded-full transition-opacity duration-400"
                style={{ background: theme.bg, opacity: isFocused ? 1 : 0 }}
              />
              <input
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={`Ask about ${subject.name}...`}
                className="flex-1 px-4 py-3 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm font-medium"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-12 h-12 rounded-[16px] text-white flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:scale-95 hover:scale-105 active:scale-95 shrink-0"
                style={{
                  background: !isLoading && input.trim() ? theme.bg : `${theme.glow}40`,
                  boxShadow: !isLoading && input.trim() ? `0 6px 20px -4px ${theme.glow}50` : "none",
                }}
              >
                <Send size={18} className={isLoading ? "opacity-50" : ""} />
              </button>
            </form>
            <p className="text-center text-[10px] text-muted-foreground/50 mt-2 font-medium">
              Teacher's {subject.name} Reference
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default ChatbotPage;
