import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SplashScreen from "@/components/SplashScreen";
import LoginPage from "@/components/LoginPage";
import TeacherRegistration from "@/components/TeacherRegistration";

type AppPhase = "splash" | "login" | "register";

const Index = () => {
  const { user } = useAuth();
  const [phase, setPhase] = useState<AppPhase>("splash");
  const navigate = useNavigate();

  const getRoute = (role: string | null) => {
    if (role === "admin") return "/admin";
    if (role === "principal") return "/principal";
    return "/dashboard";
  };

  const handleSplashFinished = useCallback(() => {
    if (user) {
      navigate(getRoute(user.role));
    } else {
      setPhase("login");
    }
  }, [user, navigate]);

  const handleLoginSuccess = useCallback((role: "admin" | "principal" | "teacher") => {
    navigate(getRoute(role));
  }, [navigate]);

  if (phase === "splash") {
    return <SplashScreen onFinished={handleSplashFinished} />;
  }

  if (phase === "register") {
    return <TeacherRegistration onBack={() => setPhase("login")} />;
  }

  return (
    <LoginPage
      onLoginSuccess={handleLoginSuccess}
      onCreateAccount={() => setPhase("register")}
    />
  );
};

export default Index;
