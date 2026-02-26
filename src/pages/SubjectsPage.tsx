import { useParams, useNavigate } from "react-router-dom";
import { classesData } from "@/data/classesData";
import { subjectStyles } from "@/components/SubjectBadge";
import PageShell from "@/components/PageShell";
import DashboardHeader from "@/components/DashboardHeader";
import BreadcrumbNav from "@/components/BreadcrumbNav";

const subjectThemes: Record<string, { bg: string; shadow: string }> = {
  english:         { bg: "linear-gradient(135deg, hsl(235,78%,62%), hsl(260,80%,55%))", shadow: "hsl(235,78%,65%)" },
  mathematics:     { bg: "linear-gradient(135deg, hsl(340,80%,55%), hsl(14,100%,58%))", shadow: "hsl(340,80%,55%)" },
  urdu:            { bg: "linear-gradient(135deg, hsl(160,60%,38%), hsl(130,65%,45%))", shadow: "hsl(160,60%,40%)" },
  islamiat:        { bg: "linear-gradient(135deg, hsl(45,95%,52%), hsl(25,100%,55%))", shadow: "hsl(45,90%,50%)" },
  science:         { bg: "linear-gradient(135deg, hsl(200,85%,50%), hsl(185,75%,42%))", shadow: "hsl(200,80%,50%)" },
  computer:        { bg: "linear-gradient(135deg, hsl(270,72%,55%), hsl(295,65%,50%))", shadow: "hsl(270,70%,55%)" },
  "social-studies": { bg: "linear-gradient(135deg, hsl(20,85%,52%), hsl(38,95%,50%))", shadow: "hsl(20,80%,55%)" },
  "general-science": { bg: "linear-gradient(135deg, hsl(170,62%,42%), hsl(195,75%,48%))", shadow: "hsl(170,60%,45%)" },
};

const defaultTheme = { bg: "linear-gradient(135deg, hsl(235,78%,62%), hsl(260,80%,55%))", shadow: "hsl(235,78%,65%)" };

const SubjectsPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const cls = classesData.find((c) => c.id === Number(classId));

  if (!cls) return <div className="p-10 text-center">Class not found</div>;

  return (
    <PageShell>
      <DashboardHeader showBack subtitle={`${cls.name} — Choose a subject`} />
      <BreadcrumbNav crumbs={[
        { label: "Dashboard", path: "/dashboard" },
        { label: cls.name },
      ]} />

      <div className="flex-1 px-8 pb-8">
        <h2
          className="text-2xl font-bold text-foreground mb-6 mt-4"
          style={{
            animation: "slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.3s",
            opacity: 0,
          }}
        >
          Choose a Subject
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {cls.subjects.map((subject, i) => {
            const style = subjectStyles[subject.id] || { gradient: "", letter: "?" };
            const theme = subjectThemes[subject.id] || defaultTheme;
            return (
              <button
                key={subject.id}
                onClick={() => navigate(`/class/${cls.id}/subject/${subject.id}`)}
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
                <div className="absolute inset-0" style={{ background: theme.bg }} />

                {/* Decorative circles */}
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-700" />
                <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-white/[0.07] group-hover:scale-125 transition-transform duration-700 delay-100" />

                {/* Shimmer sweep */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                    style={{ animation: "shimmer 2s ease-in-out infinite" }}
                  />
                </div>

                <div
                  className="relative z-10 flex items-center justify-center py-12 px-5"
                  style={{ animation: "float 4s ease-in-out infinite", animationDelay: `${i * 0.3}s` }}
                >
                  <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.2)] text-center leading-tight">
                    {subject.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
};

export default SubjectsPage;
