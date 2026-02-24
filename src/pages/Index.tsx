import { useState, useCallback } from "react";
import SplashScreen from "@/components/SplashScreen";
import LoginPage from "@/components/LoginPage";
import LandingPage from "@/components/LandingPage";

type AppPhase = "splash" | "login" | "landing";

const Index = () => {
  const [phase, setPhase] = useState<AppPhase>("splash");

  const handleSplashFinished = useCallback(() => setPhase("login"), []);
  const handleLoginSuccess = useCallback(() => setPhase("landing"), []);

  if (phase === "splash") {
    return <SplashScreen onFinished={handleSplashFinished} />;
  }

  if (phase === "login") {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return <LandingPage />;
};

export default Index;
