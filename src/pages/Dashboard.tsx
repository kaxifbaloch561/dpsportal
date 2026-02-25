import { useNavigate } from "react-router-dom";
import { classesData } from "@/data/classesData";
import PageShell from "@/components/PageShell";
import DashboardHeader from "@/components/DashboardHeader";
import BreadcrumbNav from "@/components/BreadcrumbNav";

const classThemes = [
  { bg: "linear-gradient(135deg, hsl(235,78%,62%), hsl(260,80%,55%))", shadow: "hsl(235,78%,65%)" },
  { bg: "linear-gradient(135deg, hsl(340,80%,55%), hsl(14,100%,58%))", shadow: "hsl(340,80%,55%)" },
  { bg: "linear-gradient(135deg, hsl(160,60%,38%), hsl(130,65%,45%))", shadow: "hsl(160,60%,40%)" },
  { bg: "linear-gradient(135deg, hsl(45,95%,52%), hsl(25,100%,55%))", shadow: "hsl(45,90%,50%)" },
  { bg: "linear-gradient(135deg, hsl(200,85%,50%), hsl(185,75%,42%))", shadow: "hsl(200,80%,50%)" },
  { bg: "linear-gradient(135deg, hsl(270,72%,55%), hsl(295,65%,50%))", shadow: "hsl(270,70%,55%)" },
  { bg: "linear-gradient(135deg, hsl(20,85%,52%), hsl(38,95%,50%))", shadow: "hsl(20,80%,55%)" },
  { bg: "linear-gradient(135deg, hsl(170,62%,42%), hsl(195,75%,48%))", shadow: "hsl(170,60%,45%)" },
  { bg: "linear-gradient(135deg, hsl(350,72%,52%), hsl(325,80%,48%))", shadow: "hsl(350,70%,55%)" },
  { bg: "linear-gradient(135deg, hsl(210,72%,48%), hsl(235,78%,62%))", shadow: "hsl(210,70%,50%)" },
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {classesData.map((cls, i) => {
            const theme = classThemes[i];
            return (
              <button
                key={cls.id}
                onClick={() => navigate(`/class/${cls.id}`)}
                className="group relative cursor-pointer overflow-hidden rounded-[28px] border-0 p-0 transition-all duration-500 hover:-translate-y-4"
                style={{
                  animation: `cardEntrance 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards ${0.4 + i * 0.07}s`,
                  opacity: 0,
                  boxShadow: `0 8px 32px -8px ${theme.shadow}55`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 20px 60px -12px ${theme.shadow}88, 0 0 0 2px rgba(255,255,255,0.15)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `0 8px 32px -8px ${theme.shadow}55`;
                }}
              >
                {/* Gradient background */}
                <div
                  className="absolute inset-0"
                  style={{ background: theme.bg }}
                />

                {/* Decorative circles */}
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-700" />
                <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-white/[0.07] group-hover:scale-125 transition-transform duration-700 delay-100" />

                {/* Shimmer sweep */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden"
                >
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                    style={{ animation: "shimmer 2s ease-in-out infinite" }}
                  />
                </div>

                {/* Floating content */}
                <div
                  className="relative z-10 flex flex-col items-center gap-4 py-8 px-5"
                  style={{ animation: "float 4s ease-in-out infinite", animationDelay: `${i * 0.3}s` }}
                >
                  {/* Glass number badge */}
                  <div className="w-[72px] h-[72px] rounded-[20px] bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_20px_-6px_rgba(0,0,0,0.15)] group-hover:scale-110 group-hover:rotate-3 group-hover:bg-white/30 transition-all duration-500">
                    <span className="text-[32px] font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
                      {cls.id}
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[15px] font-bold text-white tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
                      {cls.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-white/60" />
                      <span className="text-[11px] text-white/75 font-semibold uppercase tracking-widest">
                        {cls.subjects.length} Subjects
                      </span>
                      <div className="w-1 h-1 rounded-full bg-white/60" />
                    </div>
                  </div>

                  {/* Animated accent bar */}
                  <div className="relative h-1 w-10 rounded-full overflow-hidden bg-white/20 group-hover:w-14 transition-all duration-600">
                    <div
                      className="absolute inset-0 bg-white/60 rounded-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700"
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
};

export default Dashboard;
