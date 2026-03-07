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
    <div className="flex flex-col items-center gap-2 px-4 sm:px-8 pt-5 sm:pt-8 pb-3 sm:pb-4 relative">
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 sm:left-8 top-5 sm:top-8 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300"
        >
          <ArrowLeft size={18} />
        </button>
      )}
      <img src={schoolLogo} alt="DPS SIBI" className="w-11 h-11 sm:w-14 sm:h-14" />
      <div className="text-center">
        <h1 className="text-xs sm:text-sm font-semibold text-foreground tracking-widest uppercase font-sans">
          DPS Portal
        </h1>
        {subtitle && (
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 max-w-[250px] sm:max-w-none truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
