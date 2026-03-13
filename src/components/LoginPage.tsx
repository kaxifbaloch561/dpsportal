import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, BookOpen, UserPlus, HelpCircle, Download, Smartphone, Shield, MessageSquare, Brain, CalendarDays, Megaphone, ChevronRight, Sparkles } from "lucide-react";
import schoolLogo from "@/assets/school-logo.png";
import { useAuth } from "@/contexts/AuthContext";

interface LoginPageProps {
  onLoginSuccess: (role: "admin" | "principal" | "teacher") => void;
  onCreateAccount: () => void;
}

const LoginPage = ({ onLoginSuccess, onCreateAccount }: LoginPageProps) => {
  const { login } = useAuth();
  const navTo = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      const trimmed = email.trim().toLowerCase();
      const role = trimmed === "adminkaxif@dps" ? "admin" : trimmed === "principal.access@dps.portal" ? "principal" : "teacher";
      onLoginSuccess(role);
    } else {
      setError(result.error || "Login failed");
    }
  };

  const features = [
    { icon: BookOpen, title: "Digital Chapters", desc: "Access textbooks & study materials instantly" },
    { icon: Brain, title: "AI Chatbot", desc: "Get instant answers to your questions" },
    { icon: CalendarDays, title: "Lesson Planner", desc: "Organize & schedule your daily lessons" },
    { icon: MessageSquare, title: "Discussion Room", desc: "Collaborate with fellow teachers" },
    { icon: Megaphone, title: "Announcements", desc: "Stay updated with school notices" },
    { icon: Shield, title: "Secure Access", desc: "Role-based login for teachers & admin" },
  ];

  return (
    <div className="min-h-[100dvh] flex bg-background">
      {/* ===== LEFT: Login Form ===== */}
      <div className="w-full lg:w-[480px] xl:w-[520px] shrink-0 flex flex-col justify-center px-6 sm:px-10 lg:px-14 py-8 relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }} />

        <div className="relative z-10 w-full max-w-sm mx-auto">
          {/* Logo & Title */}
          <div className="flex flex-col items-center mb-8" style={{ animation: "slideDown 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards" }}>
            <div className="w-20 h-20 rounded-full overflow-hidden bg-card shadow-xl mb-4 border-2 border-primary/20 ring-4 ring-primary/5">
              <img src={schoolLogo} alt="DPS SIBI" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">DPS Portal</h1>
            <p className="text-muted-foreground text-sm mt-1">Divisional Public School, SIBI</p>
          </div>

          {/* Badge */}
          <div
            className="flex items-center justify-center gap-2 mb-6 py-2.5 rounded-2xl bg-primary text-primary-foreground text-sm font-bold shadow-lg relative overflow-hidden"
            style={{ animation: "slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.2s", opacity: 0 }}
          >
            <BookOpen size={16} />
            Teachers Login Portal
            <span className="absolute top-0 w-1/2 h-full" style={{
              background: "linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.3), rgba(255,255,255,0))",
              transform: "skewX(-25deg)",
              animation: "shine 4s infinite",
            }} />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" style={{ animation: "slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.4s", opacity: 0 }}>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Email or ID</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-2xl bg-muted border border-border/50 outline-none text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-2xl bg-muted border border-border/50 outline-none text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-12 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                <input type="checkbox" className="rounded accent-primary" />
                Remember me
              </label>
              <a href="#" className="text-primary font-semibold hover:underline">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_hsl(var(--primary)/0.4)] disabled:opacity-70 active:scale-[0.98]"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? "Signing In..." : "Sign In"}
                {!loading && <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />}
              </span>
              <span className="absolute top-0 w-1/2 h-full" style={{
                background: "linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.4), rgba(255,255,255,0))",
                transform: "skewX(-25deg)",
                animation: "shine 4s infinite",
              }} />
            </button>
          </form>

          {/* Bottom links */}
          <div className="mt-6 flex flex-col items-center gap-3" style={{ animation: "slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.6s", opacity: 0 }}>
            <button
              onClick={onCreateAccount}
              className="group w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-primary/30 text-primary text-sm font-bold hover:border-primary/60 hover:bg-primary/5 transition-all active:scale-[0.98]"
            >
              <UserPlus size={16} />
              Create Teacher Account
              <Sparkles size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button
              onClick={() => navTo("/teacher-guide")}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <HelpCircle size={13} />
              How to create an account?
            </button>

            {/* Mobile-only download button */}
            <div className="lg:hidden w-full mt-2">
              <a
                href="/DPS-Portal.apk"
                download="DPS-Portal.apk"
                className="group flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-gradient-to-r from-primary to-accent-foreground text-primary-foreground transition-all hover:-translate-y-0.5 active:scale-[0.98] relative overflow-hidden"
                style={{ boxShadow: "0 8px 32px hsl(var(--primary) / 0.3)" }}
              >
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <Smartphone size={16} />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold">Download Android App</div>
                  <div className="text-[10px] opacity-70">DPS-Portal.apk</div>
                </div>
                <Download size={16} className="shrink-0 group-hover:animate-bounce" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ===== RIGHT: Portal Introduction (hidden on mobile) ===== */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent-foreground" />

        {/* Animated mesh pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(hsl(0 0% 100% / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.1) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }} />

        {/* Floating orbs */}
        <div className="absolute top-[15%] right-[10%] w-64 h-64 rounded-full bg-white/[0.06] blur-3xl" style={{ animation: "floatBlob 10s ease-in-out infinite" }} />
        <div className="absolute bottom-[20%] left-[5%] w-48 h-48 rounded-full bg-white/[0.04] blur-2xl" style={{ animation: "floatBlob 14s ease-in-out infinite reverse" }} />
        <div className="absolute top-[50%] right-[30%] w-32 h-32 rounded-full bg-white/[0.05] blur-xl" style={{ animation: "floatBlob 8s ease-in-out infinite 2s" }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 py-10 w-full">
          {/* School branding */}
          <div className="mb-10" style={{ animation: "slideDown 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.3s", opacity: 0 }}>
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white/10 border border-white/20 shadow-2xl mb-5 backdrop-blur-sm">
              <img src={schoolLogo} alt="DPS SIBI" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight">
              Welcome to<br />
              <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">DPS Portal</span>
            </h2>
            <p className="text-white/60 text-sm mt-3 max-w-md leading-relaxed">
              A comprehensive digital platform for Divisional Public School, SIBI — empowering teachers with modern tools for education management.
            </p>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-2 gap-3 mb-10" style={{ animation: "slideUp 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.5s", opacity: 0 }}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
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

          {/* Download APK Card */}
          <div style={{ animation: "slideUp 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.7s", opacity: 0 }}>
            <a
              href="/DPS-Portal.apk"
              download="DPS-Portal.apk"
              className="group relative flex items-center gap-4 p-4 rounded-2xl bg-white/[0.1] border border-white/[0.12] hover:bg-white/[0.15] hover:border-white/[0.2] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] overflow-hidden"
            >
              {/* Shimmer */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
                <div className="absolute inset-0" style={{
                  background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 55%, transparent 60%)",
                  backgroundSize: "200% 100%",
                  animation: "shine 3s infinite",
                }} />
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

          {/* Bottom tagline */}
          <div className="mt-8 flex items-center gap-3" style={{ animation: "slideUp 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.9s", opacity: 0 }}>
            <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em]">Developed by Kaxif Gull ❤️</p>
            <div className="h-px flex-1 bg-gradient-to-l from-white/20 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;