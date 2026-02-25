import { useNavigate } from "react-router-dom";
import { classesData } from "@/data/classesData";
import PageShell from "@/components/PageShell";
import DashboardHeader from "@/components/DashboardHeader";
import BreadcrumbNav from "@/components/BreadcrumbNav";

const classGradients = [
  "from-[hsl(235,78%,65%)] to-[hsl(260,70%,60%)]",
  "from-[hsl(340,80%,55%)] to-[hsl(14,100%,60%)]",
  "from-[hsl(160,60%,40%)] to-[hsl(145,70%,50%)]",
  "from-[hsl(45,90%,50%)] to-[hsl(30,100%,55%)]",
  "from-[hsl(200,80%,50%)] to-[hsl(180,70%,45%)]",
  "from-[hsl(270,70%,55%)] to-[hsl(290,60%,50%)]",
  "from-[hsl(20,80%,55%)] to-[hsl(40,90%,50%)]",
  "from-[hsl(170,60%,45%)] to-[hsl(200,70%,50%)]",
  "from-[hsl(350,70%,55%)] to-[hsl(330,80%,50%)]",
  "from-[hsl(210,70%,50%)] to-[hsl(235,78%,65%)]",
];

const classPatterns = [
  "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)",
  "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.15) 0%, transparent 50%)",
  "radial-gradient(circle at 90% 90%, rgba(255,255,255,0.12) 0%, transparent 50%)",
  "radial-gradient(circle at 10% 10%, rgba(255,255,255,0.15) 0%, transparent 50%)",
  "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.12) 0%, transparent 50%)",
  "radial-gradient(circle at 80% 80%, rgba(255,255,255,0.15) 0%, transparent 50%)",
  "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12) 0%, transparent 50%)",
  "radial-gradient(circle at 90% 10%, rgba(255,255,255,0.15) 0%, transparent 50%)",
  "radial-gradient(circle at 10% 90%, rgba(255,255,255,0.12) 0%, transparent 50%)",
  "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)",
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <PageShell>
      <DashboardHeader subtitle="Select your class to begin" />
      <BreadcrumbNav crumbs={[{ label: "Dashboard" }]} />

      <div className="flex-1 px-8 pb-8">
        <h2
          className="text-2xl font-bold text-foreground mb-6 mt-4"
          style={{
            animation: "slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.3s",
            opacity: 0,
          }}
        >
          Select Your Class
        </h2>

        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5"
          style={{
            animation: "slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.5s",
            opacity: 0,
          }}
        >
          {classesData.map((cls, i) => (
            <button
              key={cls.id}
              onClick={() => navigate(`/class/${cls.id}`)}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border-0 p-0 shadow-lg hover:shadow-2xl hover:-translate-y-3 transition-all duration-500"
              style={{
                animationDelay: `${0.6 + i * 0.05}s`,
              }}
            >
              {/* Full gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${classGradients[i]} transition-all duration-500`} />
              
              {/* Decorative light pattern */}
              <div
                className="absolute inset-0 opacity-100"
                style={{ background: classPatterns[i] }}
              />

              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/0 group-hover:from-white/0 group-hover:via-white/20 group-hover:to-white/0 transition-all duration-700" />

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center gap-3 p-7">
                {/* Class number */}
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-3xl font-black text-white group-hover:scale-110 group-hover:bg-white/30 transition-all duration-500 shadow-lg">
                  {cls.id}
                </div>

                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-bold text-white tracking-wide">
                    {cls.name}
                  </span>
                  <span className="text-[11px] text-white/70 font-medium">
                    {cls.subjects.length} Subjects
                  </span>
                </div>

                {/* Bottom accent line */}
                <div className="w-8 h-1 rounded-full bg-white/30 group-hover:w-12 group-hover:bg-white/50 transition-all duration-500" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </PageShell>
  );
};

export default Dashboard;
