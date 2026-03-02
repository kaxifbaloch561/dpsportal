import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SplashScreen from "@/components/SplashScreen";
import LoginPage from "@/components/LoginPage";

type AppPhase = "splash" | "login";

const Index = () => {
  const { user } = useAuth();
  const [phase, setPhase] = useState<AppPhase>("splash");
  const navigate = useNavigate();

  const handleSplashFinished = useCallback(() => {
    if (user) {
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } else {
      setPhase("login");
    }
  }, [user, navigate]);

  const handleLoginSuccess = useCallback((role: "admin" | "teacher") => {
    navigate(role === "admin" ? "/admin" : "/dashboard");
  }, [navigate]);

  if (phase === "splash") {
    return <SplashScreen onFinished={handleSplashFinished} />;
  }

  return <LoginPage onLoginSuccess={handleLoginSuccess} />;
};

export default Index;
