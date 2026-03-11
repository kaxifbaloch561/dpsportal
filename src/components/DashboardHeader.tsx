import schoolLogo from "@/assets/school-logo.png";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardHeaderProps {
  showBack?: boolean;
  subtitle?: string;
}

const DashboardHeader = ({ showBack = false, subtitle }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";

  return (
    <div className={`flex flex-col items-center gap-1.5 sm:gap-2 px-3 sm:px-8 ${isTeacher ? 'pt-1 sm:pt-2' : 'pt-3 sm:pt-8'} pb-2 sm:pb-4 relative`}>
      {showBack && !isTeacher && (
        <button
          onClick={() => navigate(-1)}
          className="absolute left-3 sm:left-8 top-3 sm:top-8 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 active:scale-95"
        >
          <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>
      )}
      <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-white shadow-md">
        <img src={schoolLogo} alt="DPS SIBI" className="w-full h-full object-cover" />
      </div>
      <div className="text-center">
        <h1 className="text-xs sm:text-base font-semibold text-foreground tracking-widest uppercase font-sans">
          DPS Portal
        </h1>
        {subtitle && (
          <p className="text-[10px] sm:text-sm text-muted-foreground mt-0.5 max-w-[220px] sm:max-w-none truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;