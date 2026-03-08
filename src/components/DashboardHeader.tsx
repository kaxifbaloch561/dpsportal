import schoolLogo from "@/assets/school-logo.png";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  showBack?: boolean;
  subtitle?: string;
}

const DashboardHeader = ({ showBack = false, subtitle }: DashboardHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center gap-1.5 sm:gap-2 px-3 sm:px-8 pt-3 sm:pt-8 pb-2 sm:pb-4 relative">
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="absolute left-3 sm:left-8 top-3 sm:top-8 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 active:scale-95"
        >
          <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>
      )}
      <img src={schoolLogo} alt="DPS SIBI" className="w-9 h-9 sm:w-14 sm:h-14" />
      <div className="text-center">
        <h1 className="text-[10px] sm:text-sm font-semibold text-foreground tracking-widest uppercase font-sans">
          DPS Portal
        </h1>
        {subtitle && (
          <p className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 max-w-[220px] sm:max-w-none truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;