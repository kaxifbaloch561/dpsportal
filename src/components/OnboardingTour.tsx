import { useState, useEffect, useCallback, useRef } from "react";
import {
  X, ChevronRight, ChevronLeft, Send, Fingerprint, Megaphone,
  MessagesSquare, Sparkles, AlertTriangle, Info, BookOpen,
  Rocket, PartyPopper
} from "lucide-react";

interface TourStep {
  targetId: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  position: "top" | "bottom" | "left" | "right";
}

const tourSteps: TourStep[] = [
  {
    targetId: "tour-inbox",
    title: "📨 Inbox — Your Messages",
    description: "Tap here to open your private messaging. Chat with Admin & Principal, send text, images & files, and see delivery & read receipts. Unread messages show a badge count.",
    icon: Send,
    color: "hsl(235,78%,62%)",
    position: "bottom",
  },
  {
    targetId: "tour-profile",
    title: "👤 Your Profile",
    description: "View your details — name, email, assigned subjects & class. Change your avatar, update password, and see your account status anytime.",
    icon: Fingerprint,
    color: "hsl(270,72%,55%)",
    position: "bottom",
  },
  {
    targetId: "tour-announcements",
    title: "📢 Announcements",
    description: "Stay updated! The Admin posts important school announcements here. Active ones show a badge count. Expired announcements are automatically removed.",
    icon: Megaphone,
    color: "hsl(45,95%,48%)",
    position: "bottom",
  },
  {
    targetId: "tour-discussion",
    title: "💬 Discussion Room",
    description: "A group chat for all teachers, Admin & Principal. Share text, images, voice recordings & documents. Reply to messages and see who's online.",
    icon: MessagesSquare,
    color: "hsl(160,60%,38%)",
    position: "bottom",
  },
  {
    targetId: "tour-quick-actions",
    title: "⚡ Quick Actions",
    description: "Three shortcut buttons: Ask for Features (request new app features), Report a Problem (notify admin), and How to Use (open the full guide).",
    icon: Sparkles,
    color: "hsl(340,80%,55%)",
    position: "bottom",
  },
  {
    targetId: "tour-classes",
    title: "🎓 Select a Class",
    description: "Tap any class card to explore its subjects. Each subject has a Chatbot for AI Q&A, View Chapters for reading, and Make a Paper for generating test papers.",
    icon: BookOpen,
    color: "hsl(200,85%,50%)",
    position: "top",
  },
];

const TOUR_KEY = "dps_onboarding_tour_v2";

interface Props {
  userEmail: string;
  onComplete?: () => void;
}

const OnboardingTour = ({ userEmail, onComplete }: Props) => {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(-1); // -1 = welcome screen
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [arrowPos, setArrowPos] = useState<{ top: number; left: number; side: string }>({ top: 0, left: 0, side: "top" });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const prevHighlightRef = useRef<string | null>(null);

  useEffect(() => {
    const key = `${TOUR_KEY}_${userEmail}`;
    if (!localStorage.getItem(key)) {
      const timer = setTimeout(() => setActive(true), 800);
      return () => clearTimeout(timer);
    }
  }, [userEmail]);

  const clearHighlight = useCallback((targetId?: string) => {
    const id = targetId || prevHighlightRef.current;
    if (!id) return;
    const el = document.getElementById(id);
    if (el) {
      el.style.zIndex = "";
      el.style.boxShadow = "";
      el.style.position = "";
    }
    if (id === prevHighlightRef.current) prevHighlightRef.current = null;
  }, []);

  const clearAllHighlights = useCallback(() => {
    tourSteps.forEach((s) => clearHighlight(s.targetId));
  }, [clearHighlight]);

  const positionTooltip = useCallback(() => {
    if (!active || step < 0 || step >= tourSteps.length) return;
    const currentStep = tourSteps[step];
    const el = document.getElementById(currentStep.targetId);
    if (!el) return;

    // Highlight
    if (prevHighlightRef.current && prevHighlightRef.current !== currentStep.targetId) {
      clearHighlight();
    }
    el.style.position = "relative";
    el.style.zIndex = "10001";
    el.style.boxShadow = `0 0 0 3px ${currentStep.color}66, 0 0 30px 6px ${currentStep.color}22`;
    el.style.transition = "box-shadow 0.4s ease, z-index 0s";
    prevHighlightRef.current = currentStep.targetId;

    const rect = el.getBoundingClientRect();
    const tooltip = tooltipRef.current;
    const tw = tooltip?.offsetWidth || 340;
    const th = tooltip?.offsetHeight || 200;
    const gap = 16;

    let top = 0, left = 0;
    let aTop = 0, aLeft = 0;
    let side = currentStep.position;

    if (side === "bottom") {
      top = rect.bottom + gap;
      left = rect.left + rect.width / 2 - tw / 2;
      aTop = -6;
      aLeft = tw / 2 - 6;
    } else if (side === "top") {
      top = rect.top - th - gap;
      left = rect.left + rect.width / 2 - tw / 2;
      aTop = th - 1;
      aLeft = tw / 2 - 6;
    } else if (side === "right") {
      top = rect.top + rect.height / 2 - th / 2;
      left = rect.right + gap;
      aTop = th / 2 - 6;
      aLeft = -6;
    } else {
      top = rect.top + rect.height / 2 - th / 2;
      left = rect.left - tw - gap;
      aTop = th / 2 - 6;
      aLeft = tw - 1;
    }

    // Clamp
    left = Math.max(10, Math.min(left, window.innerWidth - tw - 10));
    top = Math.max(10, Math.min(top, window.innerHeight - th - 10));

    setTooltipStyle({ top, left, width: tw });
    setArrowPos({ top: aTop, left: aLeft, side });
  }, [active, step, clearHighlight]);

  useEffect(() => {
    if (!active || step < 0) return;
    positionTooltip();
    const onResize = () => positionTooltip();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [active, step, positionTooltip]);

  useEffect(() => {
    if (active && step >= 0) {
      requestAnimationFrame(() => requestAnimationFrame(positionTooltip));
    }
  }, [active, step]);

  const completeTour = useCallback(() => {
    clearAllHighlights();
    setActive(false);
    localStorage.setItem(`${TOUR_KEY}_${userEmail}`, "true");
    onComplete?.();
  }, [userEmail, clearAllHighlights, onComplete]);

  const next = useCallback(() => {
    if (step < tourSteps.length - 1) setStep((s) => s + 1);
    else completeTour();
  }, [step, completeTour]);

  const prev = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
    else setStep(-1);
  }, [step]);

  // Keyboard
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") completeTour();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, next, prev, completeTour]);

  if (!active) return null;

  const isWelcome = step === -1;
  const total = tourSteps.length;
  const progress = isWelcome ? 0 : ((step + 1) / total) * 100;

  // Welcome screen
  if (isWelcome) {
    return (
      <>
        <div className="fixed inset-0 z-[10000] bg-black/60" style={{ animation: "tourFadeIn 0.3s ease" }} />
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4" style={{ animation: "tourFadeIn 0.4s ease" }}>
          <div className="relative w-full max-w-[380px] rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(145deg, hsl(235,78%,62%), hsl(270,72%,55%), hsl(200,85%,50%))",
              boxShadow: "0 40px 80px -20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            {/* Noise texture */}
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
            {/* Orbs */}
            <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-white/8 blur-xl" />

            <div className="relative z-10 flex flex-col items-center px-6 sm:px-8 py-10 sm:py-12 text-center">
              <div className="w-20 h-20 rounded-[22px] bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center mb-5 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.3)]"
                style={{ animation: "tourBounceIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s both" }}>
                <Rocket size={36} className="text-white drop-shadow-lg" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight drop-shadow-lg"
                style={{ animation: "tourSlideUp 0.5s ease 0.3s both" }}>
                Welcome to DPS Portal! 🎉
              </h2>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-8 max-w-[300px]"
                style={{ animation: "tourSlideUp 0.5s ease 0.4s both" }}>
                Let us show you around! We'll highlight each feature one by one so you know exactly how to use everything.
              </p>

              <button
                onClick={() => setStep(0)}
                className="group h-12 px-8 rounded-2xl bg-white text-gray-900 font-bold text-sm flex items-center gap-2 hover:scale-105 active:scale-[0.98] transition-all duration-300 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.3)]"
                style={{ animation: "tourSlideUp 0.5s ease 0.5s both" }}
              >
                Start Tour
                <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={completeTour}
                className="mt-4 text-white/60 text-xs font-medium hover:text-white/90 transition-colors"
                style={{ animation: "tourSlideUp 0.5s ease 0.6s both" }}
              >
                Skip, I know my way around
              </button>
            </div>
          </div>
        </div>
        <style>{tourStyles}</style>
      </>
    );
  }

  const currentStep = tourSteps[step];
  const Icon = currentStep.icon;
  const isLast = step === total - 1;

  // Completion screen
  if (false) { /* handled by completeTour */ }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-[3px]"
        style={{ animation: "tourFadeIn 0.3s ease" }}
        onClick={completeTour}
      />

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        className="fixed z-[10002] max-w-[340px] w-[92vw]"
        style={{ ...tooltipStyle, animation: "tourCardEnter 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}
        key={step}
      >
        <div
          className="rounded-2xl overflow-hidden border border-white/10"
          style={{
            background: "hsl(var(--background))",
            boxShadow: `0 25px 60px -12px ${currentStep.color}44, 0 0 0 1px hsl(var(--border))`,
          }}
        >
          {/* Colored top accent bar */}
          <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${currentStep.color}, ${currentStep.color}88)` }} />

          {/* Progress bar */}
          <div className="mx-4 mt-3 flex items-center gap-2.5">
            <div className="flex-1 h-1 rounded-full bg-muted/40 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%`, background: currentStep.color }}
              />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
              {step + 1}/{total}
            </span>
            <button
              onClick={completeTour}
              className="w-6 h-6 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors shrink-0"
            >
              <X size={11} />
            </button>
          </div>

          {/* Icon + content */}
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-start gap-3">
              <div
                className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${currentStep.color}, ${currentStep.color}cc)`,
                  boxShadow: `0 8px 24px -4px ${currentStep.color}44`,
                }}
              >
                <Icon size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-extrabold text-foreground mb-1 leading-tight">
                  {currentStep.title}
                </h3>
                <p className="text-[12px] sm:text-[13px] text-muted-foreground leading-relaxed">
                  {currentStep.description}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/50 bg-muted/20">
            {/* Dots */}
            <div className="flex items-center gap-1">
              {tourSteps.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === step ? 18 : 6,
                    height: 6,
                    background: i === step ? currentStep.color : i < step ? `${currentStep.color}55` : "hsl(var(--border))",
                  }}
                />
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              {step > 0 && (
                <button
                  onClick={prev}
                  className="w-8 h-8 rounded-xl border border-border bg-background flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
              )}
              <button
                onClick={next}
                className="h-8 px-4 rounded-xl text-white text-[11px] font-bold flex items-center gap-1 hover:opacity-90 active:scale-[0.97] transition-all"
                style={{
                  background: currentStep.color,
                  boxShadow: `0 4px 16px -2px ${currentStep.color}55`,
                }}
              >
                {isLast ? "Got it! 🎉" : "Next"}
                {!isLast && <ChevronRight size={12} />}
              </button>
            </div>
          </div>

          {/* Skip */}
          {!isLast && (
            <div className="flex justify-center pb-2.5">
              <button onClick={completeTour} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                Skip tour
              </button>
            </div>
          )}
        </div>

        {/* Arrow */}
        <div
          className="absolute w-3 h-3 rotate-45"
          style={{
            top: arrowPos.top,
            left: arrowPos.left,
            background: "hsl(var(--background))",
            borderTop: arrowPos.side === "bottom" ? `1px solid hsl(var(--border))` : "none",
            borderLeft: arrowPos.side === "bottom" ? `1px solid hsl(var(--border))` : "none",
            borderBottom: arrowPos.side === "top" ? `1px solid hsl(var(--border))` : "none",
            borderRight: arrowPos.side === "top" ? `1px solid hsl(var(--border))` : "none",
          }}
        />
      </div>

      <style>{tourStyles}</style>
    </>
  );
};

const tourStyles = `
  @keyframes tourFadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes tourCardEnter { from { opacity: 0; transform: translateY(10px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
  @keyframes tourBounceIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
  @keyframes tourSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
`;

export default OnboardingTour;
