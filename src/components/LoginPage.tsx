import { useState } from "react";
import { Eye, EyeOff, BookOpen } from "lucide-react";
import schoolLogo from "@/assets/school-logo.png";
import { useAuth } from "@/contexts/AuthContext";

interface LoginPageProps {
  onLoginSuccess: (role: "admin" | "teacher") => void;
}

const LoginPage = ({ onLoginSuccess }: LoginPageProps) => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = login(email, password);
    if (result.success) {
      const role = email.trim().toLowerCase() === "adminkaxif@dps" ? "admin" : "teacher";
      onLoginSuccess(role);
    } else {
      setError(result.error || "Login failed");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-5"
      style={{
        background: "linear-gradient(-45deg, hsl(235, 60%, 68%), hsl(235, 65%, 58%), hsl(240, 50%, 72%), hsl(235, 70%, 62%))",
        backgroundSize: "400% 400%",
        animation: "gradientBG 15s ease infinite",
      }}
    >
      {/* Floating blobs */}
      <div className="fixed top-[-100px] left-[10%] w-[350px] h-[350px] bg-blob-blue rounded-full blur-[40px] opacity-60" style={{ animation: "floatBlob 8s ease-in-out infinite" }} />
      <div className="fixed bottom-[-100px] right-[20%] w-[400px] h-[400px] bg-blob-pink blur-[40px] opacity-60" style={{ borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%", animation: "floatBlob 12s ease-in-out infinite reverse" }} />

      <div
        className="w-full max-w-md bg-card/95 backdrop-blur-xl rounded-[40px] p-10 relative overflow-hidden"
        style={{
          boxShadow: "0 40px 80px rgba(0,0,0,0.2), inset 0 0 0 2px rgba(255,255,255,0.5)",
          animation: "containerSpring 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8" style={{ animation: "slideDown 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.3s", opacity: 0 }}>
          <img src={schoolLogo} alt="DPS SIBI" className="w-24 h-24 mb-3" />
          <h1 className="text-2xl font-bold text-foreground">DPS Login Portal</h1>
          <p className="text-muted-foreground text-sm">Divisional Public School, SIBI</p>
        </div>

        {/* Badge */}
        <div className="flex items-center justify-center gap-2 mb-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-lg" style={{ animation: "slideUp 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.5s", opacity: 0 }}>
          <BookOpen size={16} />
          Teacher & Admin Portal
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
              className="w-full px-4 py-3 rounded-2xl bg-muted border-none outline-none text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary transition-all"
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
                className="w-full px-4 py-3 rounded-2xl bg-muted border-none outline-none text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary transition-all pr-12"
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

          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
              <input type="checkbox" className="rounded accent-primary" />
              Remember me
            </label>
            <a href="#" className="text-primary font-medium hover:underline">Forgot password?</a>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-full bg-primary text-primary-foreground font-bold text-base relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
            style={{ boxShadow: "0 15px 30px hsl(235, 78%, 65%, 0.5)" }}
          >
            <span className="relative z-10">Sign In</span>
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

        <p className="text-center text-sm text-muted-foreground mt-6" style={{ animation: "slideUp 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.9s", opacity: 0 }}>
          Learning is Light — DPS SIBI
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
