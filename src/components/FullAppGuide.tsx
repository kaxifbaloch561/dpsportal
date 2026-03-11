import { useState, useCallback, useRef, useEffect } from "react";
import {
  X, ChevronRight, ChevronLeft, Send, Fingerprint, Megaphone,
  MessagesSquare, Sparkles, AlertTriangle, Info, BookOpen,
  MessageSquare, FileText, ClipboardList, PenLine, CheckCircle2,
  ToggleLeft, Bot, Layers, LayoutDashboard, GraduationCap,
  ArrowRight, Rocket
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface GuideSlide {
  icon: any;
  title: string;
  description: string;
  highlights?: { icon: any; label: string }[];
  color: string;
}

const slides: GuideSlide[] = [
  {
    icon: Rocket,
    title: "Welcome to DPS Portal! 🎉",
    description: "This quick guide will walk you through every feature of the app so you can get started confidently. Swipe or tap Next to continue.",
    color: "hsl(235,78%,62%)",
  },
  {
    icon: LayoutDashboard,
    title: "Your Dashboard",
    description: "The Dashboard is your home screen. From here you can access all features — your inbox, profile, announcements, discussion room, quick actions, and all your classes.",
    highlights: [
      { icon: Send, label: "Inbox" },
      { icon: Fingerprint, label: "Profile" },
      { icon: Megaphone, label: "Announcements" },
      { icon: MessagesSquare, label: "Discussion" },
    ],
    color: "hsl(235,78%,62%)",
  },
  {
    icon: Send,
    title: "Inbox — Your Messages",
    description: "Tap the Inbox button (top-left) to open your private messaging. You can chat with the Admin and Principal. Send text messages, attach images/files, and see delivery & read receipts. Unread messages show a badge count.",
    color: "hsl(200,85%,50%)",
  },
  {
    icon: Fingerprint,
    title: "Your Profile",
    description: "Tap the Profile button (top-right) to view your details — name, email, assigned subjects, and class. You can change your avatar, update your password, and see your account status.",
    color: "hsl(270,72%,55%)",
  },
  {
    icon: Megaphone,
    title: "Announcements",
    description: "Stay updated! The Admin posts important school announcements here. Active announcements show a badge count. Tap to read all current and past announcements. Expired ones are automatically removed.",
    color: "hsl(45,95%,52%)",
  },
  {
    icon: MessagesSquare,
    title: "Discussion Room",
    description: "A group chat for all teachers, Admin, and Principal. Share text messages, images, voice recordings, and documents. You can reply to specific messages, and see who's online or typing.",
    color: "hsl(160,60%,38%)",
  },
  {
    icon: Sparkles,
    title: "Quick Actions",
    description: "Three shortcut buttons below the action bar let you quickly:",
    highlights: [
      { icon: Sparkles, label: "Ask for Features — Request new app features" },
      { icon: AlertTriangle, label: "Report a Problem — Notify admin of issues" },
      { icon: Info, label: "How to Use — Open the full user guide" },
    ],
    color: "hsl(340,80%,55%)",
  },
  {
    icon: GraduationCap,
    title: "Select a Class",
    description: "The main section of your dashboard shows all available classes as colorful cards. Tap any class to explore its subjects. Each card shows how many subjects are available.",
    color: "hsl(14,100%,58%)",
  },
  {
    icon: Layers,
    title: "Subjects Page",
    description: "After selecting a class, you'll see all subjects for that class displayed as cards. Tap any subject to see what you can do with it — Chatbot, View Chapters, or Make a Paper.",
    color: "hsl(200,85%,50%)",
  },
  {
    icon: BookOpen,
    title: "Subject Options",
    description: "For each subject, you get three powerful options:",
    highlights: [
      { icon: MessageSquare, label: "Chat Bot — AI Q&A from your syllabus" },
      { icon: BookOpen, label: "View Chapters — Read course content" },
      { icon: FileText, label: "Make a Paper — Generate test papers" },
    ],
    color: "hsl(160,70%,45%)",
  },
  {
    icon: BookOpen,
    title: "Chapters — Read Content",
    description: "Browse all chapters listed for the subject. Tap any chapter to read its full content with proper formatting. Each chapter also has an Exercise button to practice questions.",
    color: "hsl(235,78%,62%)",
  },
  {
    icon: ClipboardList,
    title: "Exercises — Practice Questions",
    description: "Each chapter has multiple exercise types to test your knowledge:",
    highlights: [
      { icon: PenLine, label: "Fill in the Blanks" },
      { icon: CheckCircle2, label: "Choose the Correct Answer (MCQs)" },
      { icon: ToggleLeft, label: "True & False" },
      { icon: FileText, label: "Long & Short Question Answers" },
    ],
    color: "hsl(340,80%,55%)",
  },
  {
    icon: Bot,
    title: "AI Chatbot — Smart Q&A",
    description: "The AI Teacher Assistant searches your syllabus exercises and gives instant answers. Type a question, see live search suggestions, and get formatted answers with chapter references. Available for every subject!",
    color: "hsl(270,72%,55%)",
  },
  {
    icon: FileText,
    title: "Make a Paper — Generate Tests",
    description: "Create custom question papers! Choose Random mode (auto-generates) or Manual mode (pick chapters & question types yourself). Download the generated paper as a PDF instantly.",
    color: "hsl(160,60%,38%)",
  },
  {
    icon: CheckCircle2,
    title: "You're All Set! ✅",
    description: "You now know every feature of the DPS Portal. Explore the dashboard and start using the app. If you ever need help, tap 'How to Use' from the Quick Actions on your dashboard. Happy teaching!",
    color: "hsl(160,70%,45%)",
  },
];

const GUIDE_KEY = "dps_full_guide_completed";

interface Props {
  userEmail: string;
  onComplete: () => void;
}

const FullAppGuide = ({ userEmail, onComplete }: Props) => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

  const total = slides.length;
  const progress = ((step + 1) / total) * 100;
  const current = slides[step];
  const Icon = current.icon;
  const isLast = step === total - 1;
  const isFirst = step === 0;

  const complete = useCallback(() => {
    localStorage.setItem(`${GUIDE_KEY}_${userEmail}`, "true");
    onComplete();
  }, [userEmail, onComplete]);

  const next = useCallback(() => {
    if (isLast) { complete(); return; }
    setDirection("next");
    setStep((s) => s + 1);
  }, [isLast, complete]);

  const prev = useCallback(() => {
    if (isFirst) return;
    setDirection("prev");
    setStep((s) => s - 1);
  }, [isFirst]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") complete();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, complete]);

  // Swipe support
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
  };

  return (
    <div className="fixed inset-0 z-[10010] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6">
      <div
        ref={containerRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="relative w-full max-w-md bg-background border border-border rounded-3xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col"
        style={{ maxHeight: "min(92vh, 680px)" }}
      >
        {/* Top bar: progress + close */}
        <div className="flex items-center gap-3 px-5 pt-4 pb-2">
          <Progress value={progress} className="flex-1 h-1.5 bg-muted/40" />
          <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
            {step + 1}/{total}
          </span>
          <button
            onClick={complete}
            className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors shrink-0"
          >
            <X size={13} />
          </button>
        </div>

        {/* Slide content - scrollable */}
        <div
          key={step}
          className="flex-1 overflow-y-auto px-5 sm:px-7 py-4 sm:py-6"
          style={{
            animation: `${direction === "next" ? "guideSlideInRight" : "guideSlideInLeft"} 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
          }}
        >
          {/* Icon circle */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-[20px] sm:rounded-[24px] flex items-center justify-center shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${current.color}, ${current.color}dd)`,
                boxShadow: `0 12px 40px -8px ${current.color}55`,
              }}
            >
              <Icon size={28} className="sm:w-9 sm:h-9 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-lg sm:text-xl font-extrabold text-foreground text-center mb-2 sm:mb-3 tracking-tight leading-tight">
            {current.title}
          </h2>

          {/* Description */}
          <p className="text-[13px] sm:text-sm text-muted-foreground text-center leading-relaxed mb-4">
            {current.description}
          </p>

          {/* Highlights */}
          {current.highlights && (
            <div className="space-y-2 sm:space-y-2.5">
              {current.highlights.map((h, i) => {
                const HIcon = h.icon;
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-2.5 sm:p-3 rounded-xl bg-card border border-border/60"
                    style={{
                      animation: `guideHighlightIn 0.4s ease forwards ${0.1 + i * 0.08}s`,
                      opacity: 0,
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${current.color}18`, color: current.color }}
                    >
                      <HIcon size={15} />
                    </div>
                    <span className="text-xs sm:text-[13px] text-foreground font-medium leading-snug pt-1">
                      {h.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer: nav */}
        <div className="flex items-center justify-between px-5 py-3 sm:py-4 border-t border-border/60 bg-muted/20">
          {/* Dots */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-[140px] sm:max-w-[200px] scrollbar-hide">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > step ? "next" : "prev"); setStep(i); }}
                className={`rounded-full transition-all duration-300 shrink-0 ${
                  i === step
                    ? "w-5 h-2"
                    : i < step
                    ? "w-2 h-2"
                    : "w-2 h-2 bg-border"
                }`}
                style={{
                  background: i === step ? current.color : i < step ? `${current.color}66` : undefined,
                }}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={prev}
                className="w-9 h-9 rounded-xl border border-border bg-background flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
            )}
            <button
              onClick={next}
              className="h-9 px-5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity shadow-lg"
              style={{
                background: current.color,
                boxShadow: `0 6px 20px -4px ${current.color}55`,
              }}
            >
              {isLast ? "Let's Go!" : "Next"}
              {!isLast && <ChevronRight size={14} />}
              {isLast && <ArrowRight size={14} />}
            </button>
          </div>
        </div>

        {/* Skip link */}
        {!isLast && (
          <div className="flex justify-center pb-3">
            <button onClick={complete} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">
              Skip guide
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes guideSlideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes guideSlideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes guideHighlightIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default FullAppGuide;
