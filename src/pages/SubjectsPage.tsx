import { useParams, useNavigate } from "react-router-dom";
import { classesData } from "@/data/classesData";
import SubjectBadge from "@/components/SubjectBadge";
import { subjectStyles } from "@/components/SubjectBadge";
import { ChevronRight } from "lucide-react";
import PageShell from "@/components/PageShell";
import DashboardHeader from "@/components/DashboardHeader";

const SubjectsPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const cls = classesData.find((c) => c.id === Number(classId));

  if (!cls) return <div className="p-10 text-center">Class not found</div>;

  return (
    <PageShell>
      <DashboardHeader showBack subtitle={`${cls.name} — Choose a subject`} />

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

        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5"
          style={{
            animation: "slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.5s",
            opacity: 0,
          }}
        >
          {cls.subjects.map((subject) => {
            const style = subjectStyles[subject.id] || { gradient: "from-[hsl(235,78%,65%)] to-[hsl(260,70%,60%)]" };
            return (
              <button
                key={subject.id}
                onClick={() => navigate(`/class/${cls.id}/subject/${subject.id}`)}
                className="group bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden text-left"
              >
                <SubjectBadge subjectId={subject.id} size="md" className="shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <div className="flex-1 min-w-0">
                  <span className="text-base font-bold text-foreground block">{subject.name}</span>
                  <span className="text-xs text-muted-foreground">Tap to explore</span>
                </div>
                <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors duration-300 shrink-0" />
                <div className={`absolute inset-0 bg-gradient-to-r ${style.gradient} opacity-0 group-hover:opacity-[0.05] transition-opacity duration-300 rounded-2xl`} />
              </button>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
};

export default SubjectsPage;
