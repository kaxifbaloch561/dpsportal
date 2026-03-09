import { ReactNode } from "react";
import AdminBackButton from "@/components/AdminBackButton";

interface PageShellProps {
  children: ReactNode;
}

const PageShell = ({ children }: PageShellProps) => {
  return (
    <div
      className="h-[100dvh] flex items-center justify-center p-1.5 sm:p-5"
      style={{
        background:
          "linear-gradient(-45deg, hsl(235, 60%, 68%), hsl(235, 65%, 58%), hsl(240, 50%, 72%), hsl(235, 70%, 62%))",
        backgroundSize: "400% 400%",
        animation: "gradientBG 15s ease infinite",
      }}
    >
      {/* Floating blobs - hidden on small screens for performance */}
      <div
        className="fixed top-[-100px] left-[10%] w-[350px] h-[350px] bg-blob-blue rounded-full blur-[40px] opacity-60 hidden sm:block"
        style={{ animation: "floatBlob 8s ease-in-out infinite" }}
      />
      <div
        className="fixed bottom-[-100px] right-[20%] w-[400px] h-[400px] bg-blob-pink blur-[40px] opacity-60 hidden sm:block"
        style={{
          borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
          animation: "floatBlob 12s ease-in-out infinite reverse",
        }}
      />
      <div
        className="fixed top-[40%] left-[35%] w-[200px] h-[200px] bg-blob-green blur-[40px] opacity-60 hidden sm:block"
        style={{
          borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
          animation: "floatBlob 10s ease-in-out infinite 2s",
        }}
      />

      <div
        className="w-full max-w-[1400px] h-[calc(100dvh-12px)] sm:h-[calc(100dvh-40px)] bg-card/95 backdrop-blur-xl relative flex flex-col overflow-hidden"
        style={{
          borderRadius: "clamp(12px, 3vw, 40px)",
          boxShadow:
            "0 40px 80px rgba(0,0,0,0.2), inset 0 0 0 2px rgba(255,255,255,0.5)",
          animation:
            "containerSpring 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards",
        }}
      >
        {children}
        <AdminBackButton />
        <footer className="relative shrink-0 overflow-hidden py-3 sm:py-4">
          {/* Gradient line */}
          <div
            className="mx-auto mb-2 h-[1px] w-2/3 sm:w-1/2"
            style={{
              background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.4), hsl(var(--secondary) / 0.4), hsl(var(--primary) / 0.4), transparent)",
              animation: "shimmerLine 3s ease-in-out infinite",
            }}
          />
          <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-semibold tracking-wide">
            <span className="text-muted-foreground/50 uppercase">DPS Portal</span>
            <span className="text-muted-foreground/30">—</span>
            <span className="text-muted-foreground/50">Developed by</span>
            <span
              className="bg-clip-text text-transparent font-bold"
              style={{
                backgroundImage: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--primary)))",
                backgroundSize: "200% auto",
                animation: "gradientText 3s linear infinite",
              }}
            >
              Kaxif Gull
            </span>
            <span
              className="inline-block text-destructive"
              style={{ animation: "heartbeat 1.5s ease-in-out infinite" }}
            >
              ❤️
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PageShell;
