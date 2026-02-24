import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SplashScreen from "@/components/SplashScreen";
import LoginPage from "@/components/LoginPage";

type AppPhase = "splash" | "login";

const Index = () => {
  const [phase, setPhase] = useState<AppPhase>("splash");
  const navigate = useNavigate();

  const handleSplashFinished = useCallback(() => setPhase("login"), []);
  const handleLoginSuccess = useCallback(() => navigate("/dashboard"), [navigate]);

  if (phase === "splash") {
    return <SplashScreen onFinished={handleSplashFinished} />;
  }

  return <LoginPage onLoginSuccess={handleLoginSuccess} />;
};

export default Index;
