import { useNavigate } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export interface Crumb {
  label: string;
  path?: string; // clickable if provided
}

interface BreadcrumbNavProps {
  crumbs: Crumb[];
}

const BreadcrumbNav = ({ crumbs }: BreadcrumbNavProps) => {
  const navigate = useNavigate();

  return (
    <div className="px-8 pt-2 pb-1">
      <nav className="flex items-center gap-1 text-sm flex-wrap">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && (
                <ChevronRight size={14} className="text-muted-foreground/50 shrink-0" />
              )}
              {isLast ? (
                <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-semibold text-xs">
                  {crumb.label}
                </span>
              ) : crumb.path ? (
                <button
                  onClick={() => navigate(crumb.path!)}
                  className="px-2.5 py-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 font-medium text-xs transition-all duration-200"
                >
                  {i === 0 ? (
                    <span className="flex items-center gap-1.5">
                      <Home size={12} />
                      {crumb.label}
                    </span>
                  ) : (
                    crumb.label
                  )}
                </button>
              ) : (
                <span className="px-2.5 py-1 text-muted-foreground font-medium text-xs">
                  {crumb.label}
                </span>
              )}
            </span>
          );
        })}
      </nav>
    </div>
  );
};

export default BreadcrumbNav;
