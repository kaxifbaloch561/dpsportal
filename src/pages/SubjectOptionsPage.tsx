import { useParams, useNavigate } from "react-router-dom";
import { classesData } from "@/data/classesData";
import { MessageSquare, BookOpen, ClipboardList } from "lucide-react";
import SubjectIcon from "@/components/SubjectIcon";
import PageShell from "@/components/PageShell";
import DashboardHeader from "@/components/DashboardHeader";

const SubjectOptionsPage = () => {
  const { classId, subjectId } = useParams();
  const navigate = useNavigate();
  const cls = classesData.find((c) => c.id === Number(classId));
  const subject = cls?.subjects.find((s) => s.id === subjectId);

  if (!cls || !subject) return <div className="p-10 text-center">Not found</div>;

  const options = [
    {
      label: "Chat Bot",
      icon: <MessageSquare size={32} />,
      description: "Ask questions from your syllabus",
      path: `/class/${cls.id}/subject/${subject.id}/chat`,
      color: "bg-primary",
    },
    {
      label: "View Chapters",
      icon: <BookOpen size={32} />,
      description: "Read course content chapter by chapter",
      path: `/class/${cls.id}/subject/${subject.id}/chapters`,
      color: "bg-secondary",
    },
    {
      label: "Practice Questions",
      icon: <ClipboardList size={32} />,
      description: "Coming soon",
      path: "",
      color: "bg-muted",
      disabled: true,
    },
  ];

  return (
    <PageShell>
      <DashboardHeader showBack subtitle={`${cls.name} — ${subject.name}`} />

      <div className="flex-1 px-8 pb-8 flex flex-col items-center justify-center">
        <div
          className="flex items-center gap-3 mb-2"
          style={{
            animation: "slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.3s",
            opacity: 0,
          }}
        >
          <SubjectIcon name={subject.icon} size={28} className="text-primary" />
          <h2 className="text-2xl font-bold text-foreground">{subject.name}</h2>
        </div>
        <p className="text-muted-foreground text-sm mb-10" style={{ animation: "slideUp 0.8s ease forwards 0.4s", opacity: 0 }}>
          What would you like to do?
        </p>

        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl"
          style={{
            animation: "slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.5s",
            opacity: 0,
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={() => opt.path && navigate(opt.path)}
              disabled={opt.disabled}
              className={`group bg-card border border-border rounded-3xl p-8 flex flex-col items-center gap-4 shadow-sm transition-all duration-300 ${
                opt.disabled
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:shadow-xl hover:-translate-y-2 cursor-pointer"
              }`}
            >
              <div
                className={`w-16 h-16 rounded-2xl ${opt.color} text-primary-foreground flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
              >
                {opt.icon}
              </div>
              <span className="text-base font-bold text-foreground">{opt.label}</span>
              <span className="text-xs text-muted-foreground text-center">
                {opt.description}
              </span>
            </button>
          ))}
        </div>
      </div>
    </PageShell>
  );
};

export default SubjectOptionsPage;
