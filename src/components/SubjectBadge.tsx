// Each subject gets a unique gradient + styled abbreviation instead of generic icons
const subjectStyles: Record<string, { gradient: string; letter: string }> = {
  english:         { gradient: "from-[hsl(235,78%,65%)] to-[hsl(260,70%,60%)]", letter: "En" },
  mathematics:     { gradient: "from-[hsl(340,80%,55%)] to-[hsl(14,100%,60%)]", letter: "Ma" },
  urdu:            { gradient: "from-[hsl(160,60%,40%)] to-[hsl(145,70%,50%)]", letter: "Ur" },
  islamiat:        { gradient: "from-[hsl(45,90%,50%)] to-[hsl(30,100%,55%)]", letter: "Is" },
  science:         { gradient: "from-[hsl(200,80%,50%)] to-[hsl(180,70%,45%)]", letter: "Sc" },
  computer:        { gradient: "from-[hsl(270,70%,55%)] to-[hsl(290,60%,50%)]", letter: "Cs" },
  "social-studies": { gradient: "from-[hsl(20,80%,55%)] to-[hsl(40,90%,50%)]", letter: "SS" },
  "general-science": { gradient: "from-[hsl(170,60%,45%)] to-[hsl(200,70%,50%)]", letter: "GS" },
};

const defaultStyle = { gradient: "from-[hsl(235,78%,65%)] to-[hsl(260,70%,60%)]", letter: "?" };

interface SubjectBadgeProps {
  subjectId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-10 h-10 text-sm",
  md: "w-14 h-14 text-lg",
  lg: "w-16 h-16 text-xl",
};

const SubjectBadge = ({ subjectId, size = "md", className = "" }: SubjectBadgeProps) => {
  const style = subjectStyles[subjectId] || defaultStyle;

  return (
    <div
      className={`bg-gradient-to-br ${style.gradient} rounded-2xl flex items-center justify-center font-extrabold text-white tracking-tight shadow-lg ${sizeClasses[size]} ${className}`}
    >
      {style.letter}
    </div>
  );
};

export default SubjectBadge;
export { subjectStyles };
