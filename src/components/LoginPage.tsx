import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, BookOpen, UserPlus, HelpCircle } from "lucide-react";
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

  return (
    <div
      className="min-h-screen flex items-center justify-center p-3 sm:p-5"
      style={{
        background: "linear-gradient(-45deg, hsl(235, 60%, 68%), hsl(235, 65%, 58%), hsl(240, 50%, 72%), hsl(235, 70%, 62%))",
        backgroundSize: "400% 400%",
        animation: "gradientBG 15s ease infinite",
      }}
    >
      {/* Floating blobs - hidden on mobile */}
      <div className="fixed top-[-100px] left-[10%] w-[350px] h-[350px] bg-blob-blue rounded-full blur-[40px] opacity-60 hidden sm:block" style={{ animation: "floatBlob 8s ease-in-out infinite" }} />
      <div className="fixed bottom-[-100px] right-[20%] w-[400px] h-[400px] bg-blob-pink blur-[40px] opacity-60 hidden sm:block" style={{ borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%", animation: "floatBlob 12s ease-in-out infinite reverse" }} />

      <div
        className="w-full max-w-md bg-card/95 backdrop-blur-xl p-6 sm:p-10 relative overflow-hidden"
        style={{
          borderRadius: "clamp(20px, 5vw, 40px)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.2), inset 0 0 0 2px rgba(255,255,255,0.5)",
          animation: "containerSpring 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-6 sm:mb-8" style={{ animation: "slideDown 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.3s", opacity: 0 }}>
          <div className="w-20 h-20 sm:w-24 sm:h-24 mb-3">
            <img src={schoolLogo} alt="DPS SIBI" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">DPS Login Portal</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Divisional Public School, SIBI</p>
        </div>

        {/* Badge */}
        <div className="flex items-center justify-center gap-2 mb-5 sm:mb-6 py-2 sm:py-2.5 rounded-full bg-primary text-primary-foreground text-xs sm:text-sm font-semibold shadow-lg" style={{ animation: "slideUp 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.5s", opacity: 0 }}>
          <BookOpen size={16} />
          Teachers Login Portal
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" style={{ animation: "slideUp 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.7s", opacity: 0 }}>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email or ID</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-2xl bg-muted border-none outline-none text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary transition-all text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-2xl bg-muted border-none outline-none text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary transition-all pr-12 text-sm sm:text-base"
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

          <div className="flex justify-between items-center text-xs sm:text-sm">
            <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
              <input type="checkbox" className="rounded accent-primary" />
              Remember me
            </label>
            <a href="#" className="text-primary font-medium hover:underline">Forgot password?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 sm:py-3.5 rounded-full bg-primary text-primary-foreground font-bold text-sm sm:text-base relative overflow-hidden transition-all duration-300 hover:-translate-y-1 disabled:opacity-70"
            style={{ boxShadow: "0 15px 30px hsl(235, 78%, 65%, 0.5)" }}
          >
            <span className="relative z-10">{loading ? "Signing In..." : "Sign In"}</span>
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

        {/* Create Account Link */}
        <div className="mt-4 sm:mt-5 flex flex-col items-center gap-2" style={{ animation: "slideUp 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.9s", opacity: 0 }}>
          <button
            onClick={onCreateAccount}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary hover:underline transition-all"
          >
            <UserPlus size={16} />
            Create Teacher Account
          </button>
          <button
            onClick={() => navTo("/teacher-guide")}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <HelpCircle size={13} />
            How to create an account?
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
