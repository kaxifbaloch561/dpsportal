import schoolLogo from "@/assets/school-logo.png";

const HomePage = () => {
  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center p-1.5 sm:p-5"
      style={{
        background: "linear-gradient(-45deg, hsl(235, 60%, 68%), hsl(235, 65%, 58%), hsl(240, 50%, 72%), hsl(235, 70%, 62%))",
        backgroundSize: "400% 400%",
        animation: "gradientBG 15s ease infinite",
      }}
    >
      {/* Floating blobs - hidden on small screens for performance */}
      <div className="fixed top-[-100px] left-[10%] w-[350px] h-[350px] bg-blob-blue rounded-full blur-[40px] opacity-60 hidden sm:block" style={{ animation: "floatBlob 8s ease-in-out infinite" }} />
      <div className="fixed bottom-[-100px] right-[20%] w-[400px] h-[400px] bg-blob-pink blur-[40px] opacity-60 hidden sm:block" style={{ borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%", animation: "floatBlob 12s ease-in-out infinite reverse" }} />
      <div className="fixed top-[40%] left-[35%] w-[200px] h-[200px] bg-blob-green blur-[40px] opacity-60 hidden sm:block" style={{ borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%", animation: "floatBlob 10s ease-in-out infinite 2s" }} />

      <div
        className="w-full max-w-[1400px] min-h-[calc(100dvh-12px)] sm:min-h-[85vh] bg-card relative overflow-hidden flex flex-col"
        style={{
          borderRadius: "clamp(12px, 3vw, 40px)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.2), inset 0 0 0 2px rgba(255,255,255,0.5)",
          animation: "containerSpring 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
        }}
      >
        {/* Top header with logo */}
        <div className="flex flex-col items-center gap-2 sm:gap-3 pt-6 sm:pt-10 pb-4 sm:pb-6" style={{ animation: "slideDown 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.3s", opacity: 0 }}>
          <img src={schoolLogo} alt="DPS SIBI" className="w-16 h-16 sm:w-24 sm:h-24" />
          <h1 className="text-xs sm:text-sm font-semibold text-foreground tracking-widest uppercase font-sans">DPS Portal</h1>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex items-center justify-center px-4">
          <p className="text-muted-foreground text-base sm:text-lg font-medium text-center">Welcome to DPS SIBI</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
