import { useNavigate } from "react-router-dom";
import { classesData } from "@/data/classesData";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { Eye } from "lucide-react";

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

const AdminTeacherPreview = () => {
  const navigate = useNavigate();

  return (
    <div className="px-6 pb-8">
      <BreadcrumbNav crumbs={[{ label: "Admin", href: "/admin" }, { label: "Teacher Panel" }]} />

      <div className="flex items-center gap-2 mb-4 mt-4">
        <Eye size={20} className="text-primary" />
        <span className="font-bold text-foreground">Teacher Panel Preview</span>
        <span className="text-xs text-muted-foreground">(View as teacher)</span>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Browse the same class &amp; subject view that teachers see. Select a class to explore.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {classesData.map((cls, i) => {
          const theme = classThemes[i % classThemes.length];
          return (
            <button
              key={cls.id}
              onClick={() => navigate(`/class/${cls.id}`)}
              className="group relative cursor-pointer overflow-hidden rounded-[24px] border-0 p-0 transition-all duration-500 hover:-translate-y-3"
              style={{ boxShadow: `0 8px 28px -8px ${theme.shadow}55` }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 16px 48px -10px ${theme.shadow}88`; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 8px 28px -8px ${theme.shadow}55`; }}
            >
              <div className="absolute inset-0" style={{ background: theme.bg }} />
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10 flex flex-col items-center gap-3 py-6 px-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <span className="text-2xl font-black text-white">{cls.id}</span>
                </div>
                <span className="text-sm font-bold text-white tracking-wide">{cls.name}</span>
                <span className="text-[11px] text-white/70 font-medium">{cls.subjects.length} Subjects</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AdminTeacherPreview;
