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
    <div className="flex items-center gap-4 px-8 pt-8 pb-4">
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300"
        >
          <ArrowLeft size={20} />
        </button>
      )}
      <img src={schoolLogo} alt="DPS SIBI" className="w-14 h-14" />
      <div>
        <h1 className="text-sm font-semibold text-foreground tracking-widest uppercase font-sans">
          DPS Portal
        </h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
