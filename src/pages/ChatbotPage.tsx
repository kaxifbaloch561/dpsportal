import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { classesData } from "@/data/classesData";
import { Send, Bot, User, Sparkles, MessageCircle } from "lucide-react";
import PageShell from "@/components/PageShell";
import DashboardHeader from "@/components/DashboardHeader";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const subjectGradients: Record<string, string> = {
  math: "linear-gradient(135deg, hsl(235, 78%, 55%), hsl(280, 70%, 60%))",
  science: "linear-gradient(135deg, hsl(160, 70%, 40%), hsl(190, 80%, 50%))",
  english: "linear-gradient(135deg, hsl(340, 75%, 55%), hsl(20, 90%, 60%))",
  hindi: "linear-gradient(135deg, hsl(30, 90%, 55%), hsl(45, 95%, 55%))",
  "social-studies": "linear-gradient(135deg, hsl(200, 75%, 50%), hsl(235, 78%, 60%))",
  computer: "linear-gradient(135deg, hsl(270, 70%, 55%), hsl(310, 65%, 55%))",
  default: "linear-gradient(135deg, hsl(235, 78%, 55%), hsl(14, 100%, 65%))",
};

const ChatbotPage = () => {
  const { classId, subjectId } = useParams();
  const cls = classesData.find((c) => c.id === Number(classId));
  const subject = cls?.subjects.find((s) => s.id === subjectId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!cls || !subject) return <div className="p-10 text-center">Not found</div>;

  const gradient = subjectGradients[subject.id] || subjectGradients.default;

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

      <div className="flex-1 flex flex-col px-4 sm:px-8 pb-6 overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 overflow-y-auto space-y-5 py-4 pr-2 scroll-smooth">
          {messages.length === 0 && (
            <div
              className="flex-1 flex flex-col items-center justify-center text-center py-16"
              style={{ animation: "cardEntrance 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards" }}
            >
              {/* Animated Bot Avatar */}
              <div
                className="relative mb-6"
                style={{ animation: "float 3s ease-in-out infinite" }}
              >
                <div
                  className="w-24 h-24 rounded-[28px] flex items-center justify-center shadow-2xl"
                  style={{
                    background: gradient,
                    boxShadow: `0 12px 40px -8px hsl(235 78% 65% / 0.4)`,
                  }}
                >
                  <Bot size={44} className="text-white" />
                </div>
                {/* Decorative rings */}
                <div
                  className="absolute -inset-3 rounded-[34px] border-2 border-primary/20"
                  style={{ animation: "borderGlow 2s ease-in-out infinite" }}
                />
                <div
                  className="absolute -inset-6 rounded-[38px] border border-primary/10"
                  style={{ animation: "borderGlow 2s ease-in-out infinite 0.5s" }}
                />
                {/* Sparkle accents */}
                <div className="absolute -top-2 -right-2">
                  <Sparkles size={18} className="text-secondary" style={{ animation: "float 2s ease-in-out infinite 0.3s" }} />
                </div>
                <div className="absolute -bottom-1 -left-3">
                  <Sparkles size={14} className="text-primary/60" style={{ animation: "float 2.5s ease-in-out infinite 0.8s" }} />
                </div>
              </div>

              <h3 className="text-xl font-bold text-foreground mb-2">
                DPS.AI — {subject.name}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mb-6">
                Ask any question from your {subject.name} syllabus. I will answer
                only from your course content.
              </p>

              {/* Quick suggestion chips */}
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {[
                  `Explain a key concept in ${subject.name}`,
                  "Summarize the latest chapter",
                  "Help me with practice questions",
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(suggestion);
                    }}
                    className="px-4 py-2 rounded-full text-xs font-medium border border-border bg-card text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5"
                    style={{ animation: `cardEntrance 0.6s cubic-bezier(0.34,1.56,0.64,1) ${0.3 + idx * 0.1}s both` }}
                  >
                    <MessageCircle size={12} className="inline mr-1.5 -mt-0.5" />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              style={{
                animation: `${msg.role === "user" ? "slideUp" : "popIn"} 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards`,
              }}
            >
              {msg.role === "assistant" && (
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
                  style={{ background: gradient }}
                >
                  <Bot size={18} className="text-white" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "rounded-br-md text-white"
                    : "bg-card text-foreground rounded-bl-md border border-border/50"
                }`}
                style={
                  msg.role === "user"
                    ? {
                        background: gradient,
                        boxShadow: "0 4px 20px -4px hsl(235 78% 65% / 0.3)",
                      }
                    : undefined
                }
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="w-9 h-9 rounded-xl bg-secondary/20 border border-secondary/30 flex items-center justify-center shrink-0">
                  <User size={18} className="text-secondary" />
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
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
                style={{ background: gradient }}
              >
                <Bot size={18} className="text-white" />
              </div>
              <div className="bg-card border border-border/50 rounded-2xl rounded-bl-md px-5 py-3.5 text-sm text-muted-foreground shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary/60" style={{ animation: "float 0.8s ease-in-out infinite" }} />
                  <span className="w-2 h-2 rounded-full bg-primary/60" style={{ animation: "float 0.8s ease-in-out infinite 0.2s" }} />
                  <span className="w-2 h-2 rounded-full bg-primary/60" style={{ animation: "float 0.8s ease-in-out infinite 0.4s" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-3 mt-2"
        >
          <div className="flex-1 relative group">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask about ${subject.name}...`}
              className="w-full px-5 py-4 rounded-2xl bg-card border border-border/60 outline-none text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all duration-300 text-sm shadow-sm group-hover:shadow-md"
            />
            {/* Subtle gradient line under input on focus */}
            <div
              className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"
              style={{ background: gradient }}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-13 h-13 rounded-2xl text-white flex items-center justify-center hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none shadow-lg"
            style={{
              background: gradient,
              boxShadow: !isLoading && input.trim() ? "0 8px 25px -5px hsl(235 78% 65% / 0.4)" : undefined,
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </PageShell>
  );
};

export default ChatbotPage;
