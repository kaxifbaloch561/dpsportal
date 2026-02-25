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
    <div className="px-8 pt-3 pb-1">
      <div className="flex items-center gap-0 bg-muted/50 backdrop-blur-sm rounded-2xl p-1.5 border border-border/50 w-fit">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          const gradient = stepColors[i % stepColors.length];

          return (
            <span key={i} className="flex items-center">
              {i > 0 && (
                <div className="flex items-center px-1">
                  <div className="w-5 h-[2px] bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/10 rounded-full" />
                  <ChevronRight size={12} className="text-muted-foreground/40 -ml-0.5" />
                </div>
              )}

              {isLast ? (
                <span
                  className={`relative px-4 py-1.5 rounded-xl bg-gradient-to-r ${gradient} text-white font-semibold text-xs shadow-lg flex items-center gap-2 overflow-hidden`}
                >
                  <span className="absolute inset-0 bg-white/10 rounded-xl" />
                  <span className="relative flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    {crumb.label}
                  </span>
                </span>
              ) : crumb.path ? (
                <button
                  onClick={() => navigate(crumb.path!)}
                  className="group relative px-3.5 py-1.5 rounded-xl text-muted-foreground hover:text-foreground font-medium text-xs transition-all duration-300 flex items-center gap-1.5 hover:bg-background/80 hover:shadow-sm"
                >
                  {i === 0 && <Home size={12} className="group-hover:scale-110 transition-transform duration-200" />}
                  {crumb.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-primary/0 via-primary to-primary/0 group-hover:w-3/4 transition-all duration-300 rounded-full" />
                </button>
              ) : (
                <span className="px-3.5 py-1.5 text-muted-foreground font-medium text-xs">
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
