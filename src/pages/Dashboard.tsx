import { useNavigate } from "react-router-dom";
import { classesData } from "@/data/classesData";
import PageShell from "@/components/PageShell";
import DashboardHeader from "@/components/DashboardHeader";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <PageShell>
      <DashboardHeader subtitle="Select your class to begin" />

      <div className="flex-1 px-8 pb-8">
        <h2
          className="text-2xl font-bold text-foreground mb-6 mt-4"
          style={{
            animation: "slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.3s",
            opacity: 0,
          }}
        >
          📚 Classes
        </h2>

        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5"
          style={{
            animation: "slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.5s",
            opacity: 0,
          }}
        >
          {classesData.map((cls) => (
            <button
              key={cls.id}
              onClick={() => navigate(`/class/${cls.id}`)}
              className="group bg-card border border-border rounded-3xl p-6 flex flex-col items-center gap-3 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                {cls.id}
              </div>
              <span className="text-sm font-semibold text-foreground">
                {cls.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {cls.subjects.length} Subjects
              </span>
            </button>
          ))}
        </div>
      </div>
    </PageShell>
  );
};

export default Dashboard;
