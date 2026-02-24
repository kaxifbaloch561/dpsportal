import { useParams, useNavigate } from "react-router-dom";
import { classesData } from "@/data/classesData";
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
          📘 Subjects — {cls.name}
        </h2>

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
              <div className="text-4xl mb-1">{subject.icon}</div>
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
