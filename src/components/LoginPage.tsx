import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, BookOpen, UserPlus, HelpCircle, ChevronRight, Sparkles } from "lucide-react";
import schoolLogo from "@/assets/school-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import LoginPortalIntroduction from "@/components/login/LoginPortalIntroduction";

interface LoginPageProps {
  onLoginSuccess: (role: "admin" | "principal" | "teacher") => void;
  onCreateAccount: () => void;
}

const APP_DOWNLOAD_FILENAME = "DPS_PORTAL.apk";
const APP_DOWNLOAD_URL = `https://dpsportal.lovable.app/${APP_DOWNLOAD_FILENAME}?v=20260313`;

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

  return (
    <div className="min-h-[100dvh] flex bg-background">
      <div className="w-full lg:w-[480px] xl:w-[520px] shrink-0 flex flex-col justify-center px-6 sm:px-10 lg:px-14 py-8 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 w-full max-w-md mx-auto">
          <div className="flex flex-col items-center mb-8" style={{ animation: "slideDown 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards" }}>
            <div className="w-20 h-20 rounded-full overflow-hidden bg-card shadow-xl mb-4 border-2 border-primary/20 ring-4 ring-primary/5">
              <img src={schoolLogo} alt="DPS SIBI" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">DPS Portal</h1>
            <p className="text-muted-foreground text-sm mt-1">Divisional Public School, SIBI</p>
          </div>

          <div
            className="flex items-center justify-center gap-2 mb-6 py-2.5 rounded-2xl bg-primary text-primary-foreground text-sm font-bold shadow-lg relative overflow-hidden"
            style={{ animation: "slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.2s", opacity: 0 }}
          >
            <BookOpen size={16} />
            Teachers Login Portal
            <span
              className="absolute top-0 w-1/2 h-full"
              style={{
                background: "linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.3), rgba(255,255,255,0))",
                transform: "skewX(-25deg)",
                animation: "shine 4s infinite",
              }}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center font-medium">
              {error}
            </div>
          )}

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
              <a href="#" className="text-primary font-semibold hover:underline">
                Forgot password?
              </a>
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
              <span
                className="absolute top-0 w-1/2 h-full"
                style={{
                  background: "linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.4), rgba(255,255,255,0))",
                  transform: "skewX(-25deg)",
                  animation: "shine 4s infinite",
                }}
              />
            </button>
          </form>

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
          </div>

          <LoginPortalIntroduction mobile appDownloadUrl={APP_DOWNLOAD_URL} appDownloadFilename={APP_DOWNLOAD_FILENAME} />
        </div>
      </div>

      <LoginPortalIntroduction appDownloadUrl={APP_DOWNLOAD_URL} appDownloadFilename={APP_DOWNLOAD_FILENAME} />
    </div>
  );
};

export default LoginPage;
