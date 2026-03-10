import { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronRight, ChevronLeft, Send, Fingerprint, Megaphone, MessagesSquare, Sparkles, AlertTriangle, Info, BookOpen } from "lucide-react";

interface TourStep {
  targetId: string;
  title: string;
  description: string;
  icon: any;
  position: "top" | "bottom" | "left" | "right";
}

const tourSteps: TourStep[] = [
  {
    targetId: "tour-inbox",
    title: "Inbox",
    description: "Access your messages here. Chat with Admin, Principal, and other teachers. You'll see unread message count as a badge.",
    icon: Send,
    position: "bottom",
  },
  {
    targetId: "tour-profile",
    title: "Your Profile",
    description: "View and manage your profile details, change your password, and update your avatar from here.",
    icon: Fingerprint,
    position: "bottom",
  },
  {
    targetId: "tour-announcements",
    title: "Announcements",
    description: "Stay updated with important school announcements posted by the Admin. Active announcements show a badge count.",
    icon: Megaphone,
    position: "bottom",
  },
  {
    targetId: "tour-discussion",
    title: "Discussion Room",
    description: "Join the group discussion with all teachers, Admin and Principal. Share text, images, voice messages, and documents.",
    icon: MessagesSquare,
    position: "bottom",
  },
  {
    targetId: "tour-quick-actions",
    title: "Quick Actions",
    description: "Request new features, report problems, or access the 'How to Use' guide from these shortcuts.",
    icon: Sparkles,
    position: "bottom",
  },
  {
    targetId: "tour-classes",
    title: "Select a Class",
    description: "Tap any class card to explore its subjects, chapters, exercises, and AI-powered chatbot for Q&A.",
    icon: BookOpen,
    position: "top",
  },
];

const TOUR_KEY = "dps_tour_completed";

interface Props {
  userEmail: string;
}

const OnboardingTour = ({ userEmail }: Props) => {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const key = `${TOUR_KEY}_${userEmail}`;
    const completed = localStorage.getItem(key);
    if (!completed) {
      // Small delay to let dashboard render
      const timer = setTimeout(() => setActive(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [userEmail]);

  const positionTooltip = useCallback(() => {
    if (!active) return;
    const currentStep = tourSteps[step];
    const el = document.getElementById(currentStep.targetId);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const tooltip = tooltipRef.current;
    const tooltipWidth = tooltip?.offsetWidth || 320;
    const tooltipHeight = tooltip?.offsetHeight || 160;
    const gap = 14;

    let top = 0;
    let left = 0;
    let arrowTop = 0;
    let arrowLeft = 0;

    const pos = currentStep.position;

    if (pos === "bottom") {
      top = rect.bottom + gap;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
      arrowTop = -6;
      arrowLeft = tooltipWidth / 2 - 6;
    } else if (pos === "top") {
      top = rect.top - tooltipHeight - gap;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
      arrowTop = tooltipHeight - 1;
      arrowLeft = tooltipWidth / 2 - 6;
    } else if (pos === "right") {
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
      left = rect.right + gap;
      arrowTop = tooltipHeight / 2 - 6;
      arrowLeft = -6;
    } else {
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
      left = rect.left - tooltipWidth - gap;
      arrowTop = tooltipHeight / 2 - 6;
      arrowLeft = tooltipWidth - 1;
    }

    // Keep within viewport
    left = Math.max(12, Math.min(left, window.innerWidth - tooltipWidth - 12));
    top = Math.max(12, Math.min(top, window.innerHeight - tooltipHeight - 12));

    setTooltipStyle({ top, left, width: tooltipWidth });
    setArrowStyle({ top: arrowTop, left: arrowLeft });

    // Highlight element
    el.style.position = "relative";
    el.style.zIndex = "10001";
    el.style.boxShadow = "0 0 0 4px hsl(var(--primary) / 0.3), 0 0 20px 4px hsl(var(--primary) / 0.15)";
    el.style.borderRadius = "16px";
    el.style.transition = "box-shadow 0.3s, z-index 0s";
  }, [active, step]);

  useEffect(() => {
    if (!active) return;
    // Clear previous highlights
    tourSteps.forEach((s) => {
      const el = document.getElementById(s.targetId);
      if (el) {
        el.style.zIndex = "";
        el.style.boxShadow = "";
      }
    });
    positionTooltip();
    // Reposition on resize
    window.addEventListener("resize", positionTooltip);
    return () => window.removeEventListener("resize", positionTooltip);
  }, [active, step, positionTooltip]);

  // Reposition after tooltip renders (to get correct height)
  useEffect(() => {
    if (active) {
      requestAnimationFrame(positionTooltip);
    }
  }, [active, step]);

  const completeTour = useCallback(() => {
    setActive(false);
    localStorage.setItem(`${TOUR_KEY}_${userEmail}`, "true");
    // Clear all highlights
    tourSteps.forEach((s) => {
      const el = document.getElementById(s.targetId);
      if (el) {
        el.style.zIndex = "";
        el.style.boxShadow = "";
      }
    });
  }, [userEmail]);

  const next = () => {
    if (step < tourSteps.length - 1) setStep(step + 1);
    else completeTour();
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  if (!active) return null;

  const currentStep = tourSteps[step];
  const Icon = currentStep.icon;
  const isLast = step === tourSteps.length - 1;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-[2px]"
        style={{ animation: "fadeIn 0.3s ease" }}
        onClick={completeTour}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[10002] max-w-[320px] w-[90vw]"
        style={{
          ...tooltipStyle,
          animation: "tooltipEnter 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
      >
        <div className="bg-background border border-border rounded-2xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.3)] overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <div className="w-9 h-9 rounded-[10px] bg-foreground text-background flex items-center justify-center shrink-0">
              <Icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">{currentStep.title}</p>
              <p className="text-[10px] text-muted-foreground">Step {step + 1} of {tourSteps.length}</p>
            </div>
            <button
              onClick={completeTour}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Body */}
          <div className="px-4 py-3">
            <p className="text-[13px] text-foreground/80 leading-relaxed">{currentStep.description}</p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
            {/* Progress dots */}
            <div className="flex items-center gap-1.5">
              {tourSteps.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i === step ? "w-5 h-2 bg-foreground" : i < step ? "w-2 h-2 bg-foreground/40" : "w-2 h-2 bg-border"
                  }`}
                />
              ))}
            </div>
            {/* Buttons */}
            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={prev}
                  className="w-9 h-9 rounded-[10px] border border-border bg-background flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
              )}
              <button
                onClick={next}
                className="h-9 px-4 rounded-[10px] bg-foreground text-background text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity"
              >
                {isLast ? "Got it!" : "Next"}
                {!isLast && <ChevronRight size={14} />}
              </button>
            </div>
          </div>

          {/* Skip link */}
          <div className="flex justify-center pb-3">
            <button onClick={completeTour} className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">
              Skip tour
            </button>
          </div>
        </div>

        {/* Arrow */}
        <div
          className="absolute w-3 h-3 bg-background border border-border rotate-45"
          style={{
            ...arrowStyle,
            borderRight: currentStep.position === "bottom" ? "none" : undefined,
            borderBottom: currentStep.position === "bottom" ? "none" : undefined,
            borderLeft: currentStep.position === "top" ? "none" : undefined,
            borderTop: currentStep.position === "top" ? "none" : undefined,
          }}
        />
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes tooltipEnter { from { opacity: 0; transform: translateY(8px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </>
  );
};

export default OnboardingTour;
