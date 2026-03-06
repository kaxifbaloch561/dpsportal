import { ReactNode } from "react";
import AdminBackButton from "@/components/AdminBackButton";
interface PageShellProps {
  children: ReactNode;
}

const PageShell = ({ children }: PageShellProps) => {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-5"
      style={{
        background:
          "linear-gradient(-45deg, hsl(235, 60%, 68%), hsl(235, 65%, 58%), hsl(240, 50%, 72%), hsl(235, 70%, 62%))",
        backgroundSize: "400% 400%",
        animation: "gradientBG 15s ease infinite",
      }}
    >
      {/* Floating blobs */}
      <div
        className="fixed top-[-100px] left-[10%] w-[350px] h-[350px] bg-blob-blue rounded-full blur-[40px] opacity-60"
        style={{ animation: "floatBlob 8s ease-in-out infinite" }}
      />
      <div
        className="fixed bottom-[-100px] right-[20%] w-[400px] h-[400px] bg-blob-pink blur-[40px] opacity-60"
        style={{
          borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
          animation: "floatBlob 12s ease-in-out infinite reverse",
        }}
      />
      <div
        className="fixed top-[40%] left-[35%] w-[200px] h-[200px] bg-blob-green blur-[40px] opacity-60"
        style={{
          borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
          animation: "floatBlob 10s ease-in-out infinite 2s",
        }}
      />

      <div
        className="w-full max-w-[1400px] min-h-[85vh] bg-card/95 backdrop-blur-xl relative overflow-hidden flex flex-col"
        style={{
          borderRadius: "40px",
          boxShadow:
            "0 40px 80px rgba(0,0,0,0.2), inset 0 0 0 2px rgba(255,255,255,0.5)",
          animation:
            "containerSpring 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards",
        }}
      >
        {children}
        <footer className="text-center text-[11px] text-muted-foreground/60 font-medium py-3 mt-auto">
          DPS PORTAL — Developed by Kaxif Gull ❤️
        </footer>
      </div>
    </div>
  );
};

export default PageShell;
