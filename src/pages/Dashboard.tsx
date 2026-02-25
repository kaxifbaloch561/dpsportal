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
              className="group bg-card border border-border rounded-3xl p-6 flex flex-col items-center gap-3 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              {/* Decorative gradient ring */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${classGradients[i]} flex items-center justify-center text-2xl font-extrabold text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {cls.id}
              </div>
              <span className="text-sm font-semibold text-foreground">
                {cls.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {cls.subjects.length} Subjects
              </span>
              {/* Hover glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${classGradients[i]} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-300 rounded-3xl`} />
            </button>
          ))}
        </div>
      </div>
    </PageShell>
  );
};

export default Dashboard;
