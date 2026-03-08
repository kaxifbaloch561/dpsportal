import { useNavigate } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export interface Crumb {
  label: string;
  path?: string;
}

interface BreadcrumbNavProps {
  crumbs: Crumb[];
}

const stepColors = [
  "from-[hsl(235,78%,65%)] to-[hsl(260,70%,60%)]",
  "from-[hsl(340,80%,55%)] to-[hsl(14,100%,60%)]",
  "from-[hsl(160,60%,40%)] to-[hsl(145,70%,50%)]",
  "from-[hsl(45,90%,50%)] to-[hsl(30,100%,55%)]",
  "from-[hsl(200,80%,50%)] to-[hsl(180,70%,45%)]",
];

const BreadcrumbNav = ({ crumbs }: BreadcrumbNavProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center px-2 sm:px-4 pt-2 sm:pt-3 pb-1 overflow-x-auto scrollbar-hide">
      <div className="flex items-center gap-0 bg-card/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-1 sm:p-1.5 border border-border/40 shadow-lg shadow-primary/5 w-fit min-w-max">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          const gradient = stepColors[i % stepColors.length];

          return (
            <span key={i} className="flex items-center">
              {i > 0 && (
                <div className="flex items-center px-0.5">
                  <div className="w-3 sm:w-4 h-[2px] bg-gradient-to-r from-border to-border/50 rounded-full" />
                  <ChevronRight size={10} className="text-muted-foreground/30 -ml-0.5" />
                </div>
              )}

              {isLast ? (
                <span
                  className={`relative px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-gradient-to-r ${gradient} text-white font-semibold text-[10px] sm:text-xs shadow-lg flex items-center gap-1.5 sm:gap-2 overflow-hidden`}
                >
                  <span className="absolute inset-0 bg-white/10 rounded-lg sm:rounded-xl" />
                  <span className="relative flex items-center gap-1 sm:gap-1.5">
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white animate-pulse" />
                    {crumb.label}
                  </span>
                </span>
              ) : crumb.path ? (
                <button
                  onClick={() => navigate(crumb.path!)}
                  className="group relative px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-muted-foreground hover:text-foreground font-medium text-[10px] sm:text-xs transition-all duration-300 flex items-center gap-1 sm:gap-1.5 hover:bg-muted/60"
                >
                  {i === 0 && <Home size={10} className="group-hover:scale-110 transition-transform duration-200" />}
                  {crumb.label}
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-primary/0 via-primary to-primary/0 group-hover:w-2/3 transition-all duration-300 rounded-full" />
                </button>
              ) : (
                <span className="px-2 sm:px-3 py-1 sm:py-1.5 text-muted-foreground font-medium text-[10px] sm:text-xs">
                  {crumb.label}
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default BreadcrumbNav;