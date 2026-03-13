import { BookOpen, Brain, CalendarDays, Download, Megaphone, MessageSquare, Shield, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import schoolLogo from "@/assets/school-logo.png";

interface LoginPortalIntroductionProps {
  mobile?: boolean;
  appDownloadUrl: string;
  appDownloadFilename: string;
}

const features = [
  { icon: BookOpen, title: "Digital Chapters", desc: "Access textbooks & study materials instantly" },
  { icon: Brain, title: "AI Chatbot", desc: "Get instant answers to your questions" },
  { icon: CalendarDays, title: "Lesson Planner", desc: "Organize & schedule your daily lessons" },
  { icon: MessageSquare, title: "Discussion Room", desc: "Collaborate with fellow teachers" },
  { icon: Megaphone, title: "Announcements", desc: "Stay updated with school notices" },
  { icon: Shield, title: "Secure Access", desc: "Role-based login for teachers & admin" },
];

const LoginPortalIntroduction = ({ mobile = false, appDownloadUrl, appDownloadFilename }: LoginPortalIntroductionProps) => {
  return (
    <div className={cn(mobile ? "lg:hidden relative mt-8 overflow-hidden rounded-3xl" : "hidden lg:flex flex-1 relative overflow-hidden")}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent-foreground" />

      <div
        className={cn("absolute inset-0 opacity-10", mobile && "opacity-[0.08]")}
        style={{
          backgroundImage:
            "linear-gradient(hsl(0 0% 100% / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.1) 1px, transparent 1px)",
          backgroundSize: mobile ? "28px 28px" : "40px 40px",
        }}
      />

      <div className="absolute top-[15%] right-[10%] w-64 h-64 rounded-full bg-white/[0.06] blur-3xl" style={{ animation: "floatBlob 10s ease-in-out infinite" }} />
      <div className="absolute bottom-[20%] left-[5%] w-48 h-48 rounded-full bg-white/[0.04] blur-2xl" style={{ animation: "floatBlob 14s ease-in-out infinite reverse" }} />

      <div className={cn("relative z-10 flex w-full flex-col justify-center", mobile ? "px-5 py-6" : "px-12 xl:px-16 py-10")}>
        <div style={{ animation: mobile ? undefined : "slideDown 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.3s", opacity: mobile ? 1 : 0 }}>
          <div className={cn("rounded-2xl overflow-hidden bg-white/10 border border-white/20 shadow-2xl mb-5 backdrop-blur-sm", mobile ? "w-20 h-20" : "w-24 h-24")}>
            <img src={schoolLogo} alt="DPS SIBI" className="w-full h-full object-cover" />
          </div>
          <h2 className={cn("font-black text-white leading-tight", mobile ? "text-2xl" : "text-3xl xl:text-4xl")}>
            Welcome to
            <br />
            <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">DPS Portal</span>
          </h2>
          <p className={cn("text-white/60 mt-3 leading-relaxed", mobile ? "text-xs max-w-full" : "text-sm max-w-md")}>
            A comprehensive digital platform for Divisional Public School, SIBI — empowering teachers with modern tools for education management.
          </p>
        </div>

        <div
          className={cn("grid gap-3 mb-8 mt-6", mobile ? "grid-cols-1" : "grid-cols-2")}
          style={{ animation: mobile ? undefined : "slideUp 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.5s", opacity: mobile ? 1 : 0 }}
        >
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.07] border border-white/[0.08] hover:bg-white/[0.12] hover:border-white/[0.15] transition-all duration-300 cursor-default"
              >
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Icon size={16} className="text-white/80" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{f.title}</div>
                  <div className="text-[10px] text-white/50 leading-relaxed mt-0.5">{f.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ animation: mobile ? undefined : "slideUp 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.7s", opacity: mobile ? 1 : 0 }}>
          <a
            href={appDownloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={appDownloadFilename}
            className="group relative flex items-center gap-4 p-4 rounded-2xl bg-white/[0.1] border border-white/[0.12] hover:bg-white/[0.15] hover:border-white/[0.2] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] overflow-hidden"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden pointer-events-none">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 55%, transparent 60%)",
                  backgroundSize: "200% 100%",
                  animation: "shine 3s infinite",
                }}
              />
            </div>

            <div className="relative w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <Smartphone size={22} className="text-white" />
            </div>
            <div className="relative flex-1 min-w-0">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                Download Android App
                <span className="px-2 py-0.5 rounded-full bg-white/15 text-[9px] font-bold text-white/80 uppercase tracking-wider">APK</span>
              </div>
              <div className="text-[11px] text-white/50 mt-0.5">Install DPS Portal directly on your phone • Auto-updates via web</div>
            </div>
            <div className="relative w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
              <Download size={18} className="text-white group-hover:animate-bounce" />
            </div>
          </a>
        </div>

        {!mobile && (
          <div className="mt-8 flex items-center gap-3" style={{ animation: "slideUp 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.9s", opacity: 0 }}>
            <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em]">Developed by Kaxif Gull ❤️</p>
            <div className="h-px flex-1 bg-gradient-to-l from-white/20 to-transparent" />
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPortalIntroduction;
