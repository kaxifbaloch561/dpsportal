import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-muted px-4">
      <div className="text-center max-w-sm w-full">
        <h1 className="mb-3 text-5xl sm:text-6xl font-black text-foreground">404</h1>
        <p className="mb-6 text-base sm:text-xl text-muted-foreground">Oops! Page not found</p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm min-h-[44px] hover:-translate-y-0.5 transition-all shadow-lg"
        >
          <Home size={16} />
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
