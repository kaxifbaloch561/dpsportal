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
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-splash-bg transition-opacity duration-1000 gap-8 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] rounded-full overflow-hidden border-4 border-primary/30 shadow-2xl"
        style={{
          animation: "sibiPopAndGlow 3s ease-out forwards, sibiSoftGlow 3.5s 3s infinite alternate ease-in-out",
        }}
      >
        <img
          src={schoolLogo}
          alt="Divisional Public School SIBI"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="w-[200px] sm:w-[260px] h-[6px] rounded-full bg-primary/15 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary"
          style={{
            animation: "splashProgress 1.8s ease-in-out forwards",
          }}
        />
      </div>
    </div>
  );
};

export default SplashScreen;
