import { useEffect, useState } from "react";
import schoolLogo from "@/assets/school-logo.png";

interface SplashScreenProps {
  onFinished: () => void;
}

const SplashScreen = ({ onFinished }: SplashScreenProps) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 1800);
    const removeTimer = setTimeout(() => onFinished(), 2500);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onFinished]);

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-splash-bg transition-opacity duration-1000 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <img
        src={schoolLogo}
        alt="Divisional Public School SIBI"
        className="w-[380px] max-w-[90%]"
        style={{
          animation: "sibiPopAndGlow 3s ease-out forwards, sibiSoftGlow 3.5s 3s infinite alternate ease-in-out",
        }}
      />
    </div>
  );
};

export default SplashScreen;
