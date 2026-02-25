import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { classesData } from "@/data/classesData";
import { Send, Bot, User, Sparkles, MessageCircle, Zap, BookOpen, HelpCircle } from "lucide-react";
import schoolLogo from "@/assets/school-logo.png";
import PageShell from "@/components/PageShell";
import DashboardHeader from "@/components/DashboardHeader";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
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
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!cls || !subject) return <div className="p-10 text-center">Not found</div>;

  const theme = subjectGradients[subject.id] || subjectGradients.default;

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chatbot", {
        body: {
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          subject: subject.name,
          className: cls.name,
        },
      });

      if (error) throw error;

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err: unknown) {
      console.error("Chatbot error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    { icon: BookOpen, text: `Explain a key concept in ${subject.name}` },
    { icon: HelpCircle, text: "Summarize the latest chapter" },
    { icon: Zap, text: "Help me with practice questions" },
  ];

  return (
    <PageShell>
      <DashboardHeader
        showBack
        subtitle={`${cls.name} — ${subject.name} — Chatbot`}
      />
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
                style={{ animation: "cardEntrance 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards" }}
              >
                {/* Premium Bot Avatar with Orbital Rings */}
                <div
                  className="relative mb-8"
                  style={{ animation: "float 4s ease-in-out infinite" }}
                >
                  {/* Outer glow */}
                  <div
                    className="absolute inset-0 rounded-[32px] blur-2xl opacity-30"
                    style={{ background: theme.bg, transform: "scale(1.5)" }}
                  />
                  {/* Main icon container */}
                  <div
                    className="relative w-44 h-44 rounded-[32px] flex items-center justify-center overflow-hidden"
                  >
                    <img src={schoolLogo} alt="School Logo" className="w-40 h-40 object-contain relative z-10" />
                    {/* Inner shimmer */}
                    <div
                      className="absolute inset-0 opacity-40"
                      style={{
                        background: "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)",
                        animation: "shimmer 3s ease-in-out infinite",
                      }}
                    />
                  </div>

                  {/* Orbital ring 1 */}
                  <div
                    className="absolute -inset-4 rounded-[38px]"
                    style={{
                      border: `2px solid ${theme.glow}22`,
                      animation: "borderGlow 3s ease-in-out infinite",
                    }}
                  />
                  {/* Orbital ring 2 */}
                  <div
                    className="absolute -inset-8 rounded-[44px]"
                    style={{
                      border: `1px solid ${theme.glow}11`,
                      animation: "borderGlow 3s ease-in-out infinite 1s",
                    }}
                  />

                  {/* Floating sparkles */}
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

                {/* Title with gradient text */}
                <h3
                  className="text-2xl sm:text-3xl font-extrabold mb-2 bg-clip-text text-transparent"
                  style={{ backgroundImage: theme.bg }}
                >
                  DPS.AI
                </h3>
                <p className="text-base font-semibold text-foreground mb-1">
                  {subject.name} Assistant
                </p>
                <p className="text-sm text-muted-foreground max-w-sm mb-8">
                  Your personal AI tutor for {subject.name}. Ask anything from your syllabus — I'll help you learn!
                </p>

                {/* Suggestion Cards — modern grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl">
                  {suggestions.map((s, idx) => {
                    const Icon = s.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => setInput(s.text)}
                        className="group relative flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm text-center hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg overflow-hidden"
                        style={{ animation: `cardEntrance 0.6s cubic-bezier(0.34,1.56,0.64,1) ${0.4 + idx * 0.12}s both` }}
                      >
                        {/* Hover glow */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{ background: `radial-gradient(circle at 50% 0%, ${theme.glow}12, transparent 70%)` }}
                        />
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center relative z-10"
                          style={{ background: theme.accent }}
                        >
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
                style={{
                  animation: `${msg.role === "user" ? "slideUp" : "popIn"} 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards`,
                }}
              >
                {msg.role === "assistant" && (
                  <div className="relative shrink-0 mt-1">
                    <div
                      className="w-10 h-10 rounded-[14px] flex items-center justify-center shadow-lg"
                      style={{
                        background: theme.bg,
                        boxShadow: `0 4px 16px -4px ${theme.glow}44`,
                      }}
                    >
                      <Bot size={18} className="text-white" />
                    </div>
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-[20px] px-5 py-4 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-br-lg text-white"
                      : "bg-card/90 backdrop-blur-sm text-foreground rounded-bl-lg border border-border/40"
                  }`}
                  style={
                    msg.role === "user"
                      ? {
                          background: theme.bg,
                          boxShadow: `0 6px 24px -6px ${theme.glow}40`,
                        }
                      : {
                          boxShadow: `0 2px 12px -4px hsl(0 0% 0% / 0.06)`,
                        }
                  }
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="shrink-0 mt-1">
                    <div
                      className="w-10 h-10 rounded-[14px] flex items-center justify-center border-2"
                      style={{
                        background: theme.accent,
                        borderColor: `${theme.glow}30`,
                      }}
                    >
                      <User size={18} style={{ color: theme.glow }} />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div
                className="flex gap-3 justify-start"
                style={{ animation: "popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards" }}
              >
                <div
                  className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 shadow-lg mt-1"
                  style={{
                    background: theme.bg,
                    boxShadow: `0 4px 16px -4px ${theme.glow}44`,
                  }}
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
                          style={{
                            background: theme.bg,
                            animation: `float 1s ease-in-out infinite ${d * 0.15}s`,
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground ml-1 font-medium">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input Bar — floating glassmorphic */}
        <div className="relative z-10 px-4 sm:px-8 pb-5 pt-2">
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative flex items-center gap-3 p-2 rounded-[22px] border bg-card/80 backdrop-blur-xl transition-all duration-400"
              style={{
                borderColor: isFocused ? `${theme.glow}40` : "hsl(var(--border) / 0.6)",
                boxShadow: isFocused
                  ? `0 8px 40px -12px ${theme.glow}25, 0 0 0 1px ${theme.glow}15`
                  : "0 4px 20px -8px hsl(0 0% 0% / 0.06)",
              }}
            >
              {/* Gradient accent line at top */}
              <div
                className="absolute top-0 left-6 right-6 h-[2px] rounded-full transition-opacity duration-400"
                style={{
                  background: theme.bg,
                  opacity: isFocused ? 1 : 0,
                }}
              />

              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
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
              DPS.AI answers only from your {subject.name} syllabus
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default ChatbotPage;
