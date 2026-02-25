import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { classesData } from "@/data/classesData";
import { Send, Bot, User } from "lucide-react";
import PageShell from "@/components/PageShell";
import DashboardHeader from "@/components/DashboardHeader";
import BreadcrumbNav from "@/components/BreadcrumbNav";

interface Message {
  role: "user" | "assistant";
  content: string;
}

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

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Placeholder response — will be replaced with Longcat.chat API call
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "The AI chatbot is not connected yet. Once the Longcat.chat API is integrated, I will answer only from your syllabus content.",
        },
      ]);
      setIsLoading(false);
    }, 1200);
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

      <div className="flex-1 flex flex-col px-8 pb-6 overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2">
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20 opacity-60">
              <Bot size={48} className="text-primary mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-1">
                DPS.AI — {subject.name}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Ask any question from your {subject.name} syllabus. I will answer
                only from your course content.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-primary-foreground" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <User size={16} className="text-secondary-foreground" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Bot size={16} className="text-primary-foreground" />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-md px-5 py-3 text-sm text-muted-foreground">
                <span className="animate-pulse">Thinking...</span>
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
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${subject.name}...`}
            className="flex-1 px-5 py-3.5 rounded-2xl bg-muted border-none outline-none text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary transition-all text-sm"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </PageShell>
  );
};

export default ChatbotPage;
