import { useParams, useNavigate } from "react-router-dom";
import { useClassesData } from "@/hooks/useClassesData";
import { subjectStyles } from "@/components/SubjectBadge";
import PageShell from "@/components/PageShell";
import DashboardHeader from "@/components/DashboardHeader";
import BreadcrumbNav from "@/components/BreadcrumbNav";

const subjectThemes: Record<string, { bg: string; shadow: string; accent: string }> = {
  english:         { bg: "linear-gradient(145deg, hsl(235,78%,62%), hsl(250,85%,50%), hsl(270,75%,48%))", shadow: "hsl(235,78%,65%)", accent: "hsl(235,78%,72%)" },
  mathematics:     { bg: "linear-gradient(145deg, hsl(340,80%,55%), hsl(355,85%,52%), hsl(14,100%,58%))", shadow: "hsl(340,80%,55%)", accent: "hsl(340,80%,65%)" },
  urdu:            { bg: "linear-gradient(145deg, hsl(160,60%,38%), hsl(145,65%,40%), hsl(130,65%,45%))", shadow: "hsl(160,60%,40%)", accent: "hsl(160,60%,50%)" },
  islamiat:        { bg: "linear-gradient(145deg, hsl(45,95%,52%), hsl(35,95%,50%), hsl(25,100%,55%))", shadow: "hsl(45,90%,50%)", accent: "hsl(45,95%,62%)" },
  science:         { bg: "linear-gradient(145deg, hsl(200,85%,50%), hsl(190,80%,45%), hsl(185,75%,42%))", shadow: "hsl(200,80%,50%)", accent: "hsl(200,85%,60%)" },
  computer:        { bg: "linear-gradient(145deg, hsl(270,72%,55%), hsl(280,70%,50%), hsl(295,65%,50%))", shadow: "hsl(270,70%,55%)", accent: "hsl(270,72%,65%)" },
  "social-studies": { bg: "linear-gradient(145deg, hsl(20,85%,52%), hsl(30,90%,50%), hsl(38,95%,50%))", shadow: "hsl(20,80%,55%)", accent: "hsl(20,85%,62%)" },
  "general-science": { bg: "linear-gradient(145deg, hsl(170,62%,42%), hsl(180,68%,44%), hsl(195,75%,48%))", shadow: "hsl(170,60%,45%)", accent: "hsl(170,62%,52%)" },
  "pakistan-studies": { bg: "linear-gradient(145deg, hsl(145,55%,40%), hsl(155,60%,38%), hsl(165,55%,42%))", shadow: "hsl(145,55%,42%)", accent: "hsl(145,55%,52%)" },
};

const defaultTheme = { bg: "linear-gradient(145deg, hsl(235,78%,62%), hsl(250,80%,55%), hsl(260,80%,50%))", shadow: "hsl(235,78%,65%)", accent: "hsl(235,78%,72%)" };

const SubjectsPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { data: classesData = [], isLoading } = useClassesData();
  const cls = classesData.find((c) => c.id === Number(classId));

  if (isLoading) return (
    <PageShell>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </PageShell>
  );

  if (!cls) return <div className="p-10 text-center">Class not found</div>;

  return (
    <PageShell>
      <DashboardHeader showBack subtitle={`${cls.name} — Choose a subject`} />
      <BreadcrumbNav crumbs={[
        { label: "Dashboard", path: "/dashboard" },
        { label: cls.name },
      ]} />

      <div className="flex-1 px-4 sm:px-8 pb-6 sm:pb-8">
        <div
          className="flex items-center gap-3 mb-4 sm:mb-5 mt-3 sm:mt-4"
          style={{ animation: "slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.3s", opacity: 0 }}
        >
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-primary to-accent" />
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">Choose a Subject</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-border/60 to-transparent ml-2" />
          <span className="text-[10px] font-bold text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full">{cls.subjects.length} Subjects</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
          {cls.subjects.map((subject, i) => {
            const theme = subjectThemes[subject.id] || defaultTheme;
            return (
              <button
                key={subject.id}
                onClick={() => navigate(`/class/${cls.id}/subject/${subject.id}`)}
                className="group relative cursor-pointer overflow-hidden rounded-[22px] border-0 p-0 h-40 transition-all duration-500 hover:-translate-y-4 hover:scale-[1.02] active:scale-[0.97]"
                style={{
                  animation: `cardEntrance 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards ${0.3 + i * 0.06}s`,
                  opacity: 0,
                  boxShadow: `0 8px 32px -8px ${theme.shadow}55`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 24px 56px -12px ${theme.shadow}aa, 0 0 0 1.5px rgba(255,255,255,0.15)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `0 8px 32px -8px ${theme.shadow}55`;
                }}
              >
                {/* Gradient background */}
                <div className="absolute inset-0" style={{ background: theme.bg }} />
                {/* Noise texture */}
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")" }} />
                {/* Glass border top */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                {/* Decorative elements */}
                <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-white/[0.08] group-hover:scale-[1.8] transition-transform duration-700 ease-out" />
                <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/[0.05] group-hover:scale-[1.5] transition-transform duration-700 delay-75 ease-out" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full bg-white/[0.02] group-hover:scale-[2.5] transition-transform duration-1000" />

                {/* Shimmer sweep */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full w-full p-4 gap-2">
                  {/* Subject icon circle */}
                  <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center mb-1 shadow-[inset_0_1px_2px_rgba(255,255,255,0.25)] group-hover:scale-110 group-hover:bg-white/25 transition-all duration-500">
                    <span className="text-lg font-black text-white drop-shadow-sm">{subject.name.charAt(0)}</span>
                  </div>
                  <span className="text-[15px] sm:text-base font-extrabold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.2)] text-center leading-tight break-words max-w-full">
                    {subject.name}
                  </span>
                  {/* Bottom accent */}
                  <div className="relative h-0.5 w-6 rounded-full overflow-hidden bg-white/15 group-hover:w-10 transition-all duration-500 mt-0.5">
                    <div className="absolute inset-0 bg-white/70 rounded-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 delay-100" />
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

export default SubjectsPage;