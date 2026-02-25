import { useParams, useNavigate } from "react-router-dom";
import { classesData } from "@/data/classesData";
import { Library } from "lucide-react";
import SubjectIcon from "@/components/SubjectIcon";
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
        <div
          className="flex items-center gap-3 mb-6 mt-4"
          style={{
            animation: "slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.3s",
            opacity: 0,
          }}
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Library size={22} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Subjects — {cls.name}</h2>
        </div>

        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5"
          style={{
            animation: "slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.5s",
            opacity: 0,
          }}
        >
          {cls.subjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => navigate(`/class/${cls.id}/subject/${subject.id}`)}
              className="group bg-card border border-border rounded-3xl p-6 flex flex-col items-center gap-3 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <SubjectIcon name={subject.icon} size={28} className="text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <span className="text-sm font-semibold text-foreground text-center">
                {subject.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </PageShell>
  );
};

export default SubjectsPage;
