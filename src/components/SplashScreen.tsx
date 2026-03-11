import { useEffect, useState } from "react";
import schoolLogo from "@/assets/school-logo.png";

interface SplashScreenProps {
  onFinished: () => void;
}

const SplashScreen = ({ onFinished }: SplashScreenProps) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 1500);
    const removeTimer = setTimeout(() => onFinished(), 2000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onFinished]);

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-splash-bg transition-opacity duration-500 gap-6 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Outer glow ring */}
      <div
        className="relative"
        style={{
          animation: "sibiPopAndGlow 2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        }}
      >
        {/* Pulsing ring behind the circle */}
        <div
          className="absolute inset-[-8px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(var(--splash-glow) / 0.4) 0%, transparent 70%)",
            animation: "splashRingPulse 2s 1.5s infinite ease-in-out",
          }}
        />
        {/* Circle container with clip */}
        <div
          className="w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] rounded-full overflow-hidden border-[3px] border-[hsl(var(--splash-glow)/0.6)] shadow-[0_0_40px_hsl(var(--splash-glow)/0.3)] bg-white"
          style={{
            animation: "sibiSoftGlow 3s 2s infinite alternate ease-in-out",
          }}
        >
          <img
            src={schoolLogo}
            alt="Divisional Public School SIBI"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="w-[180px] sm:w-[240px] h-[5px] rounded-full overflow-hidden"
        style={{
          background: "hsl(var(--splash-glow) / 0.15)",
          animation: "fade-in 0.6s 0.5s both ease-out",
        }}
      >
        <div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, hsl(var(--splash-glow)), hsl(var(--primary)))",
            animation: "splashProgress 1.5s 0.2s ease-in-out forwards",
            width: "0%",
          }}
        />
      </div>
    </div>
  );
};

export default SplashScreen;
